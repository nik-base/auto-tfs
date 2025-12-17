import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSWorkfoldCommand extends TFSCommandBase {
  override readonly command = 'workfold';

  // eslint-disable-next-line @typescript-eslint/require-await
  override async buildArgs(files?: readonly Uri[]): Promise<readonly string[]> {
    if (!files?.length) {
      return [];
    }

    return [this.command, files[0].fsPath];
  }
}
