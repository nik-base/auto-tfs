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

  async info(file: Uri): Promise<void> {
    const command = new TFSInfoCommand();

    await this.commandExecutor.run(command, [file]);
  }

  async shelve(
    files: ReadonlyArray<Uri>,
    shelveName: string,
    shouldReplaceShelve: boolean
  ): Promise<void> {
    const command = new TFSShelveCommand(shelveName, shouldReplaceShelve);

    await this.commandExecutor.run(command, files);
  }

  async status(file: Uri, shouldFindSourceItemPath: boolean) {
    const command = new TFSStatusCommand(shouldFindSourceItemPath);

    await this.commandExecutor.run(command, [file]);
  }

  async view(file: Uri, sourceItemPath?: string): Promise<void> {
    const command = new TFSViewCommand(sourceItemPath);

    await this.commandExecutor.run(command, [file]);
  }

  // /**
  //  * Execute a command with confirmation
  //  */

  // async executeWithConfirmation(
  //     command: ITFSCommand,
  //     files: Uri[],
  //     additionalData?: unknown
  // ): Promise<ProcessResult | null> {
  //     if (!this.validateExecution(files)) {
  //         return null;
  //     }

  //     const optional = command as unknown as {
  //         requiresConfirmation?: () => boolean;
  //         getConfirmationMessage?: (count: number) => string;
  //         isFireAndForget?: () => boolean;
  //     };

  //     if (optional.requiresConfirmation?.()) {
  //         const message = optional.getConfirmationMessage?.(files.length) ?? 'Confirm operation?';
  //         const confirmed = await window.showWarningMessage(
  //             message,
  //             { modal: true },
  //             'Yes',
  //             'No'
  //         );

  //         if (confirmed !== 'Yes') {
  //             return null;
  //         }
  //     }

  //     try {
  //         const optional = command as unknown as { isFireAndForget?: () => boolean };
  //         const fireAndForget = optional.isFireAndForget?.() ?? false;
  //         const result = fireAndForget
  //             ? await this.executeFireAndForget(command, files, additionalData)
  //             : await this.commandExecutor.execute(command, files, additionalData);

  //         this.onCommandComplete?.(true, command);
  //         return result;
  //     } catch (error) {
  //         this.onCommandComplete?.(false, command);
  //         throw error;
  //     }
  // }

  // /**
  //  * Execute a command without confirmation
  //  */
  // async executeWithoutConfirmation(
  //     command: ITFSCommand,
  //     files: Uri[],
  //     additionalData?: unknown
  // ): Promise<ProcessResult | null> {
  //     if (!this.validateExecution(files)) {
  //         return null;
  //     }

  //     try {
  //         const optional = command as unknown as { isFireAndForget?: () => boolean };
  //         const fireAndForget = optional.isFireAndForget?.() ?? false;
  //         const result = fireAndForget
  //             ? await this.executeFireAndForget(command, files, additionalData)
  //             : await this.commandExecutor.execute(command, files, additionalData);

  //         this.onCommandComplete?.(true, command);
  //         return result;
  //     } catch (error) {
  //         this.onCommandComplete?.(false, command);
  //         throw error;
  //     }
  // }

  // /**
  //  * Execute a fire-and-forget command (doesn't wait for completion)
  //  */
  // private async executeFireAndForget(
  //     command: ITFSCommand,
  //     files: Uri[],
  //     additionalData?: unknown
  // ): Promise<ProcessResult | null> {
  //     try {
  //         await this.commandExecutor.executeFireAndForget(command, files, additionalData);
  //         return null; // Fire-and-forget doesn't return a result
  //     } catch (error) {
  //         this.onCommandComplete?.(false, command);
  //         throw error;
  //     }
  // }

  // /**
  //  * Cancel currently running command
  //  */
  // cancel(): void {
  //     this.commandExecutor.cancel();
  // }

  // /**
  //  * Validate that execution can proceed
  //  */
  // private validateExecution(files: Uri[]): boolean {
  //     if (!this.tfPath) {
  //         window.showErrorMessage('TF path is not configured. Please set auto-tfs.tf.path in settings.');
  //         return false;
  //     }

  //     if (!files || files.length === 0) {
  //         window.showWarningMessage('No files selected for operation.');
  //         return false;
  //     }

  //     return true;
  // }

  // // ===== ICommandLogger Implementation =====

  // debug(message: string): void {
  //     // TODO: Connect to proper logger
  //     console.debug(message);
  // }

  // info(message: string): void {
  //     // TODO: Connect to proper logger
  //     console.log(message);
  // }

  // error(message: string): void {
  //     // TODO: Connect to proper logger
  //     console.error(message);
  // }

  // // ===== ICommandUIProvider Implementation =====

  // showProgress(message: string): void {
  //     // TODO: Connect to StatusBar
  //     window.showInformationMessage(message);
  // }

  // showSuccess(message: string): void {
  //     // TODO: Make this non-intrusive (maybe just log?)
  //     window.showInformationMessage(message);
  // }

  // showError(message: string): void {
  //     window.showErrorMessage(message);
  // }
}
