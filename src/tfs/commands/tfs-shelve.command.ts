import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSShelveCommand extends TFSCommandBase {
  override readonly command = 'shelve';

  private readonly shelveName: string;

  private readonly shouldReplaceShelve: boolean;

  constructor(shelveName: string, shouldReplaceShelve: boolean) {
    super();

    this.shelveName = shelveName;
    this.shouldReplaceShelve = shouldReplaceShelve;
  }

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  override buildArgs(files?: readonly Uri[]): string[] {
    if (!files?.length) {
      return [];
    }

    const paths: string[] = files.map((file: Uri): string => file.fsPath);

    if (this.shouldReplaceShelve) {
      return [this.command, '/replace', this.shelveName, ...paths];
    }

    return [this.command, this.shelveName, ...paths];
  }
}
