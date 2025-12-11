import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSInfoCommand extends TFSCommandBase {
  override readonly command = 'info';

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length) {
      return [];
    }

    return [this.command, files[0].fsPath];
  }
}
