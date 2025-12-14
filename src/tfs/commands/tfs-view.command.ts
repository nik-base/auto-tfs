import { Uri } from 'vscode';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSViewCommand extends TFSCommandBase {
  override readonly command = 'view';

  private readonly sourceItemPath?: string;

  constructor(sourceItemPath?: string) {
    super();

    this.sourceItemPath = sourceItemPath;
  }

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length) {
      return [];
    }

    const uri = files[0];

    if (this.sourceItemPath) {
      return [this.command, this.sourceItemPath, '/console'];
    }

    return [this.command, uri.fsPath, '/console'];
  }
}
