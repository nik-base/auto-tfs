import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSHistoryCommand extends TFSCommandBase {
  override readonly command = 'history';

  readonly executionOptions = { useShell: true, detached: true };

  private readonly findLastChange?: boolean;

  constructor(findLastChange?: boolean) {
    super();

    this.findLastChange = findLastChange;

    if (findLastChange) {
      this.executionOptions = {
        ...this.executionOptions,
        useShell: false,
        detached: false,
      };
    }
  }

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  override buildArgs(files?: readonly Uri[]): string[] {
    if (!files?.length) {
      return [];
    }

    if (this.findLastChange) {
      return [
        this.command,
        files[0].fsPath,
        '/itemmode',
        '/noprompt',
        '/stopafter:1',
        '/format:detailed',
      ];
    }

    return [this.command, files[0].fsPath];
  }
}
