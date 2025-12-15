// src/app/services/app-version.service.ts
import { Injectable } from "@angular/core";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { BUILD_INFO } from "../../environments/build-info";

@Injectable({
  providedIn: "root",
})
export class AppVersionService {
  private cache?: {
    version: string;
    build: string;
    buildDate: string;
    commit: string;
  };

  async getVersionInfo() {
    if (this.cache) {
      return this.cache;
    }

    let version = BUILD_INFO.version;
    let build = "web";

    if (Capacitor.isNativePlatform()) {
      try {
        const info = await App.getInfo();
        version = info.version;
        build = info.build;
      } catch (err) {
        console.warn("Failed to get native app info", err);
      }
    }

    this.cache = {
      version,
      build,
      buildDate: BUILD_INFO.buildDate,
      commit: BUILD_INFO.commit,
    };

    return this.cache;
  }
}