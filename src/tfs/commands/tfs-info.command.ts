import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSInfoCommand extends TFSCommandBase {
  override readonly command = 'info';

  // eslint-disable-next-line @typescript-eslint/require-await
  override async buildArgs(files?: readonly Uri[]): Promise<readonly string[]> {
    if (!files?.length) {
      return [];
    }

    return [this.command, files[0].fsPath];
  }
}
