import { Uri } from 'vscode';
import { TFSCommandExecutor } from './tfs-command-executor';
import { TFSHistoryCommand } from './commands/tfs-history.command';
import { TFSCheckoutCommand } from './commands/tfs-checkout.command';
import { TFSAddCommand } from './commands/tfs-add.command';
import { TFSDeleteCommand } from './commands/tfs-delete.command';
import { TFSRenameCommand } from './commands/tfs-rename.command';
import { TFSUndoCommand } from './commands/tfs-undo.command';
import { TFSCheckinCommand } from './commands/tfs-checkin.command';
import { TFSDiffCommand } from './commands/tfs-diff.command';
import { TFSGetCommand } from './commands/tfs-get.command';
import { TFSInfoCommand } from './commands/tfs-info.command';
import { TFSShelveCommand } from './commands/tfs-shelve.command';
import { TFSStatusCommand } from './commands/tfs-status.command';
import { TFSViewCommand } from './commands/tfs-view.command';
import { TFSWorkfoldCommand } from './commands/tfs-workfold.command';
import { ProcessResult } from '../models';

export class TFSService {
  private readonly commandExecutor: TFSCommandExecutor;

  constructor(commandExecutor: TFSCommandExecutor) {
    this.commandExecutor = commandExecutor;
  }

  async history(
    file: Uri,
    findLastChange?: boolean
  ): Promise<ProcessResult | undefined> {
    const command = new TFSHistoryCommand(findLastChange);

    return await this.commandExecutor.run(command, [file]);
  }

  async checkout(files: readonly Uri[]): Promise<void> {
    const command = new TFSCheckoutCommand();

    await this.commandExecutor.run(command, files);
  }

  async add(files: readonly Uri[]): Promise<void> {
    const command = new TFSAddCommand();

    await this.commandExecutor.run(command, files);
  }

  async delete(files: readonly Uri[]): Promise<ProcessResult | undefined> {
    const command = new TFSDeleteCommand();

    return await this.commandExecutor.run(command, files);
  }

  async rename(oldFile: Uri, newFile: Uri): Promise<void> {
    const command = new TFSRenameCommand();

    await this.commandExecutor.run(command, [oldFile, newFile]);
  }

  async undo(files: readonly Uri[]): Promise<void> {
    const command = new TFSUndoCommand();

    await this.commandExecutor.run(command, files);
  }

  async checkin(
    files: readonly Uri[],
    checkinComment: string,
    shouldCheckinWithoutPrompt: boolean
  ): Promise<void> {
    const command = new TFSCheckinCommand(
      checkinComment,
      shouldCheckinWithoutPrompt
    );

    await this.commandExecutor.run(command, files);
  }

  async diff(file: Uri): Promise<void> {
    const command = new TFSDiffCommand();

    await this.commandExecutor.run(command, [file]);
  }

  async get(files: readonly Uri[]): Promise<void> {
    const command = new TFSGetCommand();

    await this.commandExecutor.run(command, files);
  }

  async info(file: Uri): Promise<ProcessResult | undefined> {
    const command = new TFSInfoCommand();

    return await this.commandExecutor.run(command, [file]);
  }

  async shelve(
    files: readonly Uri[],
    shelveName: string,
    shouldReplaceShelve: boolean
  ): Promise<ProcessResult | undefined> {
    const command = new TFSShelveCommand(shelveName, shouldReplaceShelve);

    return await this.commandExecutor.run(command, files);
  }

  async status(
    file: Uri,
    shouldFindSourceItemPath?: boolean
  ): Promise<ProcessResult | undefined> {
    const command = new TFSStatusCommand(shouldFindSourceItemPath);

    return await this.commandExecutor.run(command, [file]);
  }

  async triggerLogin(): Promise<ProcessResult | undefined> {
    const command = new TFSStatusCommand(false, true);

    return await this.commandExecutor.run(command);
  }

  async view(
    file: Uri,
    sourceItemPath?: string
  ): Promise<ProcessResult | undefined> {
    const command = new TFSViewCommand(sourceItemPath);

    return await this.commandExecutor.run(command, [file]);
  }

  async workfold(file: Uri): Promise<ProcessResult | undefined> {
    const command = new TFSWorkfoldCommand();

    return await this.commandExecutor.run(command, [file]);
  }
}
