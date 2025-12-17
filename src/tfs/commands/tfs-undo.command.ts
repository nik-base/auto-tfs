import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSUndoCommand extends TFSCommandBase {
  override readonly command = 'undo';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async buildArgs(files?: readonly Uri[]): Promise<readonly string[]> {
    if (!files?.length) {
      return [];
    }

    const paths: readonly string[] = files.map(
      (file: Uri): string => file.fsPath
    );

    return [this.command, '/recursive', ...paths];
  }
}
