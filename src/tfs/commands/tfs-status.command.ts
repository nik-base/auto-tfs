import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSStatusCommand extends TFSCommandBase {
  override readonly command = 'status';

  readonly executionOptions = {};

  private readonly shouldFindSourceItemPath: boolean;

  private readonly triggerLogin: boolean;

  constructor(shouldFindSourceItemPath?: boolean, triggerLogin?: boolean) {
    super();

    this.shouldFindSourceItemPath = shouldFindSourceItemPath ?? false;

    this.triggerLogin = triggerLogin ?? false;

    if (this.triggerLogin) {
      this.executionOptions = {
        ...this.executionOptions,
        useShell: true,
        detached: true,
      };
    }
  }

  override buildArgs(files?: readonly Uri[]): string[] {
    if (this.triggerLogin) {
      return [this.command];
    }

    if (!files?.length) {
      return [];
    }

    if (this.shouldFindSourceItemPath) {
      return [this.command, files[0].fsPath, '/format:detailed'];
    }

    return [this.command, '/format:detailed', files[0].fsPath, '/recursive'];
  }
}
