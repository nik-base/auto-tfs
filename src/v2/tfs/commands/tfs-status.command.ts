import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSStatusCommand extends TFSCommandBase {
  override readonly command = 'status';

  private readonly shouldFindSourceItemPath: boolean;

  constructor(shouldFindSourceItemPath?: boolean) {
    super();

    this.shouldFindSourceItemPath = shouldFindSourceItemPath ?? false;
  }

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length) {
      return [];
    }

    if (this.shouldFindSourceItemPath) {
      return [this.command, files[0].fsPath, '/format:detailed'];
    }

    return [this.command, '/format:detailed', files[0].fsPath, '/recursive'];
  }
}
