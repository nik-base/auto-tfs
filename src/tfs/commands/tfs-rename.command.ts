import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSRenameCommand extends TFSCommandBase {
  override readonly command = 'rename';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length || files.length < 2) {
      return [];
    }

    const oldUri = files[0];
    const newUri = files[1];

    return [this.command, oldUri.fsPath, newUri.fsPath];
  }
}
