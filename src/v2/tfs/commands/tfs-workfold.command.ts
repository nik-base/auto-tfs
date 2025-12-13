import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSWorkfoldCommand extends TFSCommandBase {
  override readonly command = 'workfold';

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length) {
      return [];
    }

    return [this.command, files[0].fsPath];
  }
}
