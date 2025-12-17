import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSCheckinCommand extends TFSCommandBase {
  override readonly command = 'checkin';

  readonly executionOptions = {};

  private readonly checkinComment: string;

  private readonly shouldCheckinWithoutPrompt: boolean;

  constructor(checkinComment: string, shouldCheckinWithoutPrompt: boolean) {
    super();

    this.checkinComment = checkinComment;
    this.shouldCheckinWithoutPrompt = shouldCheckinWithoutPrompt;

    if (!this.shouldCheckinWithoutPrompt) {
      this.executionOptions = {
        ...this.executionOptions,
        useShell: true,
        detached: true,
      };
    }
  }

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async buildArgs(files?: readonly Uri[]): Promise<readonly string[]> {
    if (!files?.length) {
      return [];
    }

    if (this.shouldCheckinWithoutPrompt) {
      const escapedPath = files.map((file: Uri): string =>
        decodeURI(file.fsPath)
      );

      return [
        this.command,
        `/comment:${this.checkinComment}`,
        '/noprompt',
        ...escapedPath,
      ];
    }

    const paths = files.map((file: Uri): string => `"${file.fsPath}"`);

    return [this.command, `/comment:"${this.checkinComment}"`, ...paths];
  }
}
