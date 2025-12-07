import { Uri } from 'vscode';
import { ITFSCommand } from './itfs-command';
import { lstatSync } from 'fs';
import { CommandContext, ProcessResult } from '../models';
import { AutoTFSLogger } from '../core/autotfs-logger';
import { AutoTFSNotification } from '../core/autotfs-notifcation';

export abstract class TFSCommandBase implements ITFSCommand {
  abstract readonly command: string;

  get context(): CommandContext {
    return {
      shouldNotify: false,
    };
  }

  buildArgs(files?: ReadonlyArray<Uri>): string[] {
    if (!files?.length) {
      return [];
    }

    if (
      files?.length === 1 &&
      files[0]?.fsPath &&
      lstatSync(files[0]?.fsPath).isDirectory()
    ) {
      return [this.command, '/recursive', files[0].fsPath];
    }
    const paths = files
      ?.filter((file) => file.fsPath && !lstatSync(file.fsPath).isDirectory())
      ?.map((file) => file.fsPath);

    if (!paths?.length) {
      return [];
    }

    return [this.command, ...paths];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handleResult(
    result: ProcessResult,
    _: ReadonlyArray<Uri>,
    ctx: CommandContext
  ): Promise<void> {
    if (result.success) {
      const successMessage = `AutoTFS command "${this.command}" is successful`;

      AutoTFSLogger.log(successMessage);

      if (ctx.shouldNotify) {
        AutoTFSNotification.info(successMessage);
      }
    } else {
      const errorMessage = `AutoTFS command "${this.command} failed. Error: ${result.stderr}"`;

      AutoTFSLogger.error(errorMessage);

      if (ctx.shouldNotify) {
        AutoTFSNotification.error(errorMessage);
      }
    }
  }
}
