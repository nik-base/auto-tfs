import { Uri } from 'vscode';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSCheckinCommand extends TFSCommandBase {
  override readonly command = 'checkin';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

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

  override buildArgs(files?: ReadonlyArray<Uri>): string[] {
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
