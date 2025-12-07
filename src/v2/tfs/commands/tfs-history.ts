import { ITFSCommand } from '../itfs-command';
import { Uri } from 'vscode';
import { AutoTFSLogger } from '../../core/autotfs-logger';

export class TFSHistoryCommand implements ITFSCommand {
  readonly command = 'history';

  readonly executionOptions = { useShell: true, detached: true };

  buildArgs(files?: Uri[]): string[] {
    if (!files?.length) {
      return [];
    }

    return [this.command, files[0].fsPath];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handleResult(): Promise<void> {
    AutoTFSLogger.log('History window will be opened shortly');
  }
}
