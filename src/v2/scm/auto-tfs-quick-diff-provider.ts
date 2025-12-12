import { QuickDiffProvider, Uri } from 'vscode';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';

export class AutoTFSQuickDiffProvider {
  static provider(): QuickDiffProvider {
    return {
      provideOriginalResource: this.getOriginalUri.bind(this),
    };
  }

  private static getOriginalUri(uri: Uri): Thenable<Uri> {
    return new Promise<Uri>((resolve, reject) => {
      if (!AutoTFSConfiguration.isQuickDiffEnabled) {
        reject();
      }

      reject();

      //   const parsedFilePath: ParsedPath = parse(uri.fsPath);

      //   const path: string = this.downloadFile(uri);

      //   if (!path) {
      //     reject();
      //   }

      //   const originalUri = Uri.file(path!);

      //   resolve(originalUri);
    });
  }

  private static downloadFile(file: Uri): string | null {
    // TODO: Download file
    return '';
  }
}
