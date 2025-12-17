import { QuickDiffProvider, Uri } from 'vscode';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';

export class AutoTFSQuickDiffProvider {
  static provider(): QuickDiffProvider {
    return {
      provideOriginalResource: this.getOriginalUri.bind(this),
    };
  }

  private static getOriginalUri(uri: Uri): Uri | undefined {
    if (!AutoTFSConfiguration.isQuickDiffEnabled) {
      return;
    }

    return Uri.from({
      scheme: 'tfvc',
      path: uri.fsPath,
    });
  }
}
