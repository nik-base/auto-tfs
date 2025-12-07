import { Uri } from 'vscode';
import { TFSCommandExecutor } from './tfs-command-executor';
import { ProcessExecutor } from '../process/process-executor';
import { TFSHistoryCommand } from './commands/tfs-history';
import { TFSCheckoutCommand } from './commands/tfs-checkout';

/**
 * Main service for all TFS operations
 * Provides high-level async API for extension commands
 * Replaces the old Tfs class with a cleaner, more testable design
 */
export class TFSService {
  private readonly commandExecutor: TFSCommandExecutor;

  constructor(
    commandExecutor?: TFSCommandExecutor,
    processExecutor?: ProcessExecutor
  ) {
    this.commandExecutor =
      commandExecutor ??
      new TFSCommandExecutor(processExecutor ?? new ProcessExecutor());
  }

  public async history(files: Uri): Promise<void> {
    const command = new TFSHistoryCommand();

    await this.commandExecutor.run(command, [files]);
  }

  public async checkout(files: ReadonlyArray<Uri>): Promise<void> {
    const command = new TFSCheckoutCommand();

    await this.commandExecutor.run(command, files);
  }

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
