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
import { TFSWorkfoldCommand } from './commands/tfs-workflow.command';
import { ProcessResult } from '../models';

export class TFSService {
  private readonly commandExecutor: TFSCommandExecutor;

  constructor(commandExecutor: TFSCommandExecutor) {
    this.commandExecutor = commandExecutor;
  }

  async history(file: Uri): Promise<void> {
    const command = new TFSHistoryCommand();

    await this.commandExecutor.run(command, [file]);
  }

  async checkout(files: ReadonlyArray<Uri>): Promise<void> {
    const command = new TFSCheckoutCommand();

    await this.commandExecutor.run(command, files);
  }

  async add(files: ReadonlyArray<Uri>): Promise<void> {
    const command = new TFSAddCommand();

    await this.commandExecutor.run(command, files);
  }

  async delete(files: ReadonlyArray<Uri>): Promise<void> {
    const command = new TFSDeleteCommand();

    await this.commandExecutor.run(command, files);
  }

  async rename(oldFile: Uri, newFile: Uri): Promise<void> {
    const command = new TFSRenameCommand();

    await this.commandExecutor.run(command, [oldFile, newFile]);
  }

  async undo(files: ReadonlyArray<Uri>): Promise<void> {
    const command = new TFSUndoCommand();

    await this.commandExecutor.run(command, files);
  }

  async checkin(
    files: ReadonlyArray<Uri>,
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

  async get(files: ReadonlyArray<Uri>): Promise<void> {
    const command = new TFSGetCommand();

    await this.commandExecutor.run(command, files);
  }

  async info(file: Uri): Promise<ProcessResult | undefined> {
    const command = new TFSInfoCommand();

    return await this.commandExecutor.run(command, [file]);
  }

  async shelve(
    files: ReadonlyArray<Uri>,
    shelveName: string,
    shouldReplaceShelve: boolean
  ): Promise<void> {
    const command = new TFSShelveCommand(shelveName, shouldReplaceShelve);

    await this.commandExecutor.run(command, files);
  }

  async status(
    file: Uri,
    shouldFindSourceItemPath?: boolean
  ): Promise<ProcessResult | undefined> {
    const command = new TFSStatusCommand(shouldFindSourceItemPath);

    return await this.commandExecutor.run(command, [file]);
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
