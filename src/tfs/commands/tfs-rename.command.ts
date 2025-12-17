import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSRenameCommand extends TFSCommandBase {
  override readonly command = 'rename';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async buildArgs(files?: readonly Uri[]): Promise<readonly string[]> {
    if (!files?.length || files.length < 2) {
      return [];
    }

    const oldUri = files[0];
    const newUri = files[1];

    return [this.command, oldUri.fsPath, newUri.fsPath];
  }
}
