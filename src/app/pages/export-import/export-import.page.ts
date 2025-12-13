import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ToastController,
  Platform,
  IonItem,
  IonLabel,
  IonInput,
  AlertController,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';
import { environment } from 'src/environments/environment';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { CryptoService } from 'src/app/services/crypto';

@Component({
  selector: 'app-export-import',
  templateUrl: './export-import.page.html',
  styleUrls: ['./export-import.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    TranslateModule,
    FormsModule,
    AppHeaderComponent,
    ButtonComponent,
    IonItem,
    IonLabel,
    IonInput,
  ],
})
export class ExportImportPage implements OnInit {
  public exportPassword: string = '';

  constructor(
    private storage: Storage,
    private toastController: ToastController,
    private alertController: AlertController,
    private translate: TranslateService,
    private platform: Platform,
    private cryptoService: CryptoService
  ) {}

  async ngOnInit() {
    await this.storage.create();
  }

  async exportAll() {
    try {
      const keys = await this.storage.keys();
      const result: any = {};
      for (const k of keys) {
        result[k] = await this.storage.get(k);
      }

      // Always encrypt, even if password is empty
      const password = this.exportPassword || ''; // empty string fallback
      const encryptedBase64 = await this.cryptoService.encryptJson(result, password);
      const blob = new Blob([encryptedBase64], { type: 'text/plain' });

      await this.saveFile('mymoodlog_backup.json', blob, 'text/plain');

    } catch (err: any) {
      const toast = await this.toastController.create({
        message:
          this.translate.instant('EXPORT_IMPORT.EXPORT_FAILED') ||
          ('Export failed: ' + (err?.message || err)),
        duration: 5000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  /** ==================== FILE SAVE HANDLER (copy of ExportHistoryPage.saveFile) ==================== */
  private async saveFile(
    fileName: string,
    blob: Blob,
    mimeType: string
  ): Promise<void> {
    try {
      const base64Data = await this.blobToBase64(blob);
      const pureBase64 = (base64Data as string).split(',')[1];

      if (this.platform.is('hybrid')) {
        const isAndroid = this.platform.is('android');
        const directory = isAndroid
          ? Directory.ExternalStorage
          : Directory.Documents;

        if (isAndroid) {
          try {
            await Filesystem.requestPermissions();
          } catch (permError) {
            console.warn('Permission request error:', permError);
          }
        }

        const uniquePath = await this.getUniqueFilePath(
          `Download/${fileName}`,
          directory
        );

        const result = await Filesystem.writeFile({
          path: uniquePath,
          data: pureBase64,
          directory,
          recursive: true,
        });

        console.log('File saved to:', result.uri);

        const folderName = isAndroid
          ? 'Downloads'
          : this.translate.instant('EXPORT_HISTORY.IOS_DOCUMENTS_FOLDER');

        const message =
          this.translate.instant('EXPORT_HISTORY.FILE_SAVED_READABLE', {
            fileName: uniquePath.split('/').pop(),
            folderName,
          }) ||
          `${uniquePath.split('/').pop()} saved to your ${folderName} folder.`;

        const toast = await this.toastController.create({
          message,
          duration: 4000,
          color: 'success',
        });
        await toast.present();
      } else {
        // Web fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const toast = await this.toastController.create({
          message: this.translate.instant('EXPORT_HISTORY.FILE_PREPARED', {
            fileName,
          }),
          duration: 3000,
          color: 'medium',
        });
        await toast.present();
      }
    } catch (err: any) {
      console.error('File save failed:', err);

      const toast = await this.toastController.create({
        message: this.translate.instant('EXPORT_HISTORY.FILE_SAVE_FAILED', {
          error: err.message || err,
        }),
        duration: 5000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  private blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  private async getUniqueFilePath(
    basePath: string,
    directory: Directory
  ): Promise<string> {
    const dotIndex = basePath.lastIndexOf('.');
    const name = dotIndex !== -1 ? basePath.substring(0, dotIndex) : basePath;
    const ext = dotIndex !== -1 ? basePath.substring(dotIndex) : '';

    let uniquePath = basePath;
    let counter = 1;

    while (true) {
      try {
        await Filesystem.stat({ path: uniquePath, directory });
        // File exists — generate new name
        uniquePath = `${name}_${counter}${ext}`;
        counter++;
      } catch {
        // File does not exist — use this one
        return uniquePath;
      }
    }
  }

  async onFileSelected(ev: any) {
    const file = ev?.target?.files?.[0];
    if (!file) return;

    try {
      // Read encrypted file content (it's just plain text now)
      const encryptedText = await file.text();

      // Ask user for password and attempt decryption until successful or they cancel
      while (true) {
        const input = window.prompt(
          this.translate.instant('EXPORT_IMPORT.ENTER_PASSWORD')
        );

      // Case 1: User clicked "Cancel"
      if (input === null) {
        const cancelToast = await this.toastController.create({
          message:
            this.translate.instant('EXPORT_IMPORT.IMPORT_CANCELLED') ||
            'Import cancelled by user.',
          duration: 2500,
          color: 'medium',
        });
        await cancelToast.present();
        return; // exit import completely
      }

      // Case 2: User clicked OK (possibly blank) → treat as empty string
      const pwd = input || '';

        try {
          // Attempt to decrypt the file content
          const decrypted: any = await this.cryptoService.decryptJson(
            encryptedText,
            pwd
          );

          // === Ask for confirmation before erasing current data ===
          const confirmed = await this.confirmOverwrite();

          if (!confirmed) {
            const cancelToast = await this.toastController.create({
              message:
                this.translate.instant('EXPORT_IMPORT.IMPORT_CANCELLED') ||
                'Import cancelled by user.',
              duration: 2500,
              color: 'medium',
            });
            await cancelToast.present();
            return;
          }

          // Restore all key-value pairs to Ionic Storage
          const keys = Object.keys(decrypted || {});
          for (const k of keys) {
            await this.storage.set(k, decrypted[k]);
          }

          // Show success message
          const toast = await this.toastController.create({
            message:
              this.translate.instant('EXPORT_IMPORT.IMPORT_DONE') ||
              'Import completed',
            duration: 3000,
            color: 'success',
          });
          await toast.present();
          return;
        } catch (e) {
          // Wrong password or corrupt file
          const errToast = await this.toastController.create({
            message:
              this.translate.instant('EXPORT_IMPORT.WRONG_PASSWORD') ||
              'Wrong password, try again.',
            duration: 2500,
            color: 'danger',
          });
          await errToast.present();
          // Loop again until success or cancel
        }
      }
    } catch (err: any) {
      const toast = await this.toastController.create({
        message:
          this.translate.instant('EXPORT_IMPORT.IMPORT_FAILED') ||
          'Import failed: ' + (err?.message || err),
        duration: 5000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  /**
   * Shows a confirmation alert with a 10 second timeout
   * before the "Continue" button becomes enabled.
   */
  private async confirmOverwrite(): Promise<boolean> {
    return new Promise(async (resolve) => {
      let countdown = 10;
      let continueButton!: HTMLButtonElement;

      const alert = await this.alertController.create({
        header: this.translate.instant('EXPORT_IMPORT.CONFIRM_OVERWRITE') || 'Confirm import',
        message:
         this.translate.instant('EXPORT_IMPORT.ERASE_WARNING', {
          seconds: countdown,
        }),
        backdropDismiss: false,
        buttons: [
          {
            text: this.translate.instant('COMMON.CANCEL') || 'Cancel',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: this.translate.instant('COMMON.CONTINUE') || 'Continue',
            handler: () => resolve(true),
            cssClass: 'continue-btn',
          },
        ],
      });

      await alert.present();

      continueButton = document.querySelector(
        '.alert-button.continue-btn'
      ) as HTMLButtonElement;
      if (continueButton) continueButton.disabled = true;

      const interval = setInterval(() => {
        countdown--;
        const msg = this.translate.instant('EXPORT_IMPORT.ERASE_WARNING', {
          seconds: countdown,
        });
        const messageElement = document.querySelector(
          'ion-alert .alert-message'
        );
        if (messageElement) messageElement.innerHTML = msg;

        if (countdown <= 0) {
          clearInterval(interval);
          if (continueButton) continueButton.disabled = false;
          // Update the message once unlocked
          if (messageElement)
            messageElement.innerHTML =
              this.translate.instant('EXPORT_IMPORT.ERASE_WARNING_READY');
        }
      }, 1000);
    });
  }

}
