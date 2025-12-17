import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSDiffCommand extends TFSCommandBase {
  override readonly command = 'diff';

  readonly executionOptions = { useShell: true, detached: true };

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async buildArgs(files?: readonly Uri[]): Promise<readonly string[]> {
    if (!files?.length) {
      return [];
    }

    return [this.command, `"${files[0].fsPath}"`, '/format:visual'];
  }
}
