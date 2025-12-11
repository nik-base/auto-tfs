import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSHistoryCommand extends TFSCommandBase {
  override readonly command = 'history';

  readonly executionOptions = { useShell: true, detached: true };

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length) {
      return [];
    }

    return [this.command, files[0].fsPath];
  }
}
