import { Uri } from 'vscode';
import {
  CommandContext,
  ProcessExecutionOptions,
  ProcessResult,
} from '../models';

/**
 * Primary interface each TFS command service must implement
 * - `command` holds the TF command name (e.g. 'checkout')
 * - `buildArgs` builds the CLI args for the command
 * - `handleResult` receives the ProcessResult and performs follow-up logic
 *
 * The actual process execution is done by a command executor which will call
 * `buildArgs` and then call `handleResult` after process finishes. This keeps
 * the command class responsible for business logic + post-processing while
 * reusing a single process executor.
 */
export interface ITFSCommand {
  readonly command: string;

  readonly context?: CommandContext;

  readonly executionOptions?: ProcessExecutionOptions;

  /**
   * Build CLI arguments for TF executable
   */
  buildArgs(files?: readonly Uri[], ctx?: CommandContext): string[];

  /**
   * Handle process result (stdout/stderr/exit). Commands should be resilient
   * to empty/invalid results.
   */
  handleResult(
    result: ProcessResult,
    files?: readonly Uri[],
    ctx?: CommandContext
  ): Promise<void>;

  /** Called when stdout data is received */
  onCommandOutput(data: string): void;

  /** Called when stderr data is received */
  onCommandError(data: string): void;

  /** Called when the process exits */
  onSuccess(exitCode: number): void;

  /** Called when the process encounters an error */
  onError(error: Error): void;

  /** Called when execution starts */
  onStart(): void;

  /** Called when execution completes (success or failure) */
  onComplete(): void;
}
