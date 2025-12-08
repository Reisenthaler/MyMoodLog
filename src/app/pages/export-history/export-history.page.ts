import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  ToastController,
  Platform,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MoodLogEntry } from 'src/app/models/mood-log-entry.model';
import { MoodItem } from 'src/app/models/mood-item.model';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-export-history',
  templateUrl: './export-history.page.html',
  styleUrls: ['./export-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonButton,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    TranslateModule,
    AppHeaderComponent,
  ],
})
export class ExportHistoryPage implements OnInit {
  startDate = '';
  endDate = '';
  fileType: 'json' | 'pdf' | 'word' | 'excel' = 'excel';
  moodItems: MoodItem[] = [];

  constructor(
    private router: Router,
    private storage: Storage,
    private translate: TranslateService,
    private toastController: ToastController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.storage.create();

    const entries: MoodLogEntry[] =
      (await this.storage.get('mood_log_history')) || [];
    this.moodItems = (await this.storage.get('mood_items')) || [];

    const now = new Date();
    this.endDate = this.toLocalISO(now);

    if (entries.length > 0) {
      const sorted = entries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      this.startDate = this.toLocalISO(new Date(sorted[0].date));
    } else {
      this.startDate = this.toLocalISO(now);
    }
  }

  private toLocalISO(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
  }

  async export() {
    const entries: MoodLogEntry[] =
      (await this.storage.get('mood_log_history')) || [];

    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();

    const filtered = entries.filter((e) => {
      const d = new Date(e.date).getTime();
      return d >= start && d <= end;
    });

    if (!filtered.length) {
      alert(this.translate.instant('EXPORT_HISTORY.NO_ENTRIES_FOUND'));
      return;
    }

    switch (this.fileType) {
      case 'json':
        this.exportJSON(filtered);
        break;
      case 'excel':
        this.exportExcel(filtered);
        break;
      case 'pdf':
        this.exportPDF(filtered);
        break;
      case 'word':
        this.exportWord(filtered);
        break;
    }
  }

  private getMoodName(id: string | number): string {
    const mood = this.moodItems.find((m) => m.id.toString() === id.toString());
    return mood
      ? mood.name
      : this.translate.instant('EXPORT_HISTORY.UNKNOWN_MOOD', { id });
  }

  /** ==================== JSON ==================== */
  async exportJSON(entries: MoodLogEntry[]) {
    const mapped = entries.map((entry, index) => ({
      [this.translate.instant('EXPORT_HISTORY.ENTRY')]:
        `${index + 1}: ${new Date(entry.date).toLocaleString()}`,
      [this.translate.instant('EXPORT_HISTORY.MOODS')]: Object.entries(
        entry.selections || {}
      ).map(([k, v]) => `${this.getMoodName(k)} -> ${v}`),
      [this.translate.instant('EXPORT_HISTORY.COMMENT')]:
        (entry as any).comment || '',
    }));

    const blob = new Blob([JSON.stringify(mapped, null, 2)], {
      type: 'application/json',
    });

    await this.saveFile(
      `${this.translate.instant('EXPORT_HISTORY.FILE_NAME_JSON')}.json`,
      blob,
      'application/json'
    );
  }

  /** ==================== EXCEL ==================== */
  async exportExcel(entries: MoodLogEntry[]) {
    const allMoodNames = this.moodItems.map((m) => m.name);

    const worksheetData = entries.map((entry) => {
      const row: any = {
        [this.translate.instant('EXPORT_HISTORY.DATE')]: new Date(
          entry.date
        ).toLocaleString(),
      };

      allMoodNames.forEach((mood) => (row[mood] = ''));

      Object.entries(entry.selections || {}).forEach(([k, v]) => {
        const moodName = this.getMoodName(k);
        row[moodName] = v;
      });

      row[this.translate.instant('EXPORT_HISTORY.COMMENT')] =
        (entry as any).comment || '';
      return row;
    });

    const headerOrder = [
      this.translate.instant('EXPORT_HISTORY.DATE'),
      ...allMoodNames,
      this.translate.instant('EXPORT_HISTORY.COMMENT'),
    ];
    const ws = XLSX.utils.json_to_sheet(worksheetData, { header: headerOrder });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      this.translate.instant('EXPORT_HISTORY.FILE_SHEET')
    );
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await this.saveFile(
      `${this.translate.instant('EXPORT_HISTORY.FILE_NAME_EXCEL')}.xlsx`,
      blob,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  }

  /** ==================== PDF ==================== */
  async exportPDF(entries: MoodLogEntry[]) {
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text(this.translate.instant('EXPORT_HISTORY.EXPORT_TITLE'), 10, 10);

    let y = 20;
    entries.forEach((entry, i) => {
      pdf.setFontSize(10);
      pdf.text(
        `${this.translate.instant('EXPORT_HISTORY.ENTRY')} ${
          i + 1
        }: ${new Date(entry.date).toLocaleString()}`,
        10,
        y
      );
      y += 6;

      const selections = Object.entries(entry.selections || {}).map(
        ([k, v]) => `${this.getMoodName(k)} -> ${v}`
      );

      for (const line of selections) {
        pdf.text(line, 14, y);
        y += 5;
      }

      if ((entry as any).comment) {
        pdf.text(
          `${this.translate.instant('EXPORT_HISTORY.COMMENT')}: ${
            (entry as any).comment
          }`,
          10,
          y
        );
        y += 6;
      }

      y += 6;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    const blob = pdf.output('blob');
    await this.saveFile(
      `${this.translate.instant('EXPORT_HISTORY.FILE_NAME_PDF')}.pdf`,
      blob,
      'application/pdf'
    );
  }

  /** ==================== WORD ==================== */
  async exportWord(entries: MoodLogEntry[]) {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: this.translate.instant('EXPORT_HISTORY.EXPORT_TITLE'),
              heading: HeadingLevel.HEADING_1,
            }),
            ...entries.flatMap((entry, index) => {
              const parts: Paragraph[] = [
                new Paragraph({
                  text: `${this.translate.instant('EXPORT_HISTORY.ENTRY')} ${
                    index + 1
                  } — ${new Date(entry.date).toLocaleString()}`,
                  heading: HeadingLevel.HEADING_3,
                }),
              ];

              const selections = Object.entries(entry.selections || {}).map(
                ([k, v]) =>
                  new Paragraph({
                    text: `${this.getMoodName(k)} -> ${v}`,
                  })
              );

              if ((entry as any).comment) {
                selections.push(
                  new Paragraph({
                    text: `${this.translate.instant('EXPORT_HISTORY.COMMENT')}: ${
                      (entry as any).comment
                    }`,
                  })
                );
              }

              return [...parts, ...selections, new Paragraph('')];
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    await this.saveFile(
      `${this.translate.instant('EXPORT_HISTORY.FILE_NAME_WORD')}.docx`,
      blob,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  /** ==================== FILE SAVE HANDLER ==================== */
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
        ? Directory.ExternalStorage // Public storage on Android
        : Directory.Documents; // iOS sandbox

      if (isAndroid) {
        try {
          await Filesystem.requestPermissions();
        } catch (permError) {
          console.warn('Permission request error:', permError);
        }
      }

      // Ensure unique file name
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
}