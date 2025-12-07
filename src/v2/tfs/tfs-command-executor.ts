import { ITFSCommand } from './itfs-command';
import { ProcessExecutor } from '../process/process-executor';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';
import { Uri } from 'vscode';
import { AutoTFSLogger } from '../core/autotfs-logger';
import { CommandContext, ProcessResult } from '../models';
import { AutoTFSNotification } from '../core/autotfs-notifcation';

/**
 * Responsible for running ITFSCommand implementations using ProcessExecutor
 */
export class TFSCommandExecutor {
  private readonly processExecutor: ProcessExecutor;

  constructor(processExecutor?: ProcessExecutor) {
    this.processExecutor = processExecutor ?? new ProcessExecutor();
  }

  /**
   * Run a command for the given files. If the command requests detached
   * execution (fire-and-forget) the runner will start the process and not
   * await completion.
   *
   * @returns ProcessResult when awaited, or undefined for detached executions
   */
  async run(
    command: ITFSCommand,
    files?: ReadonlyArray<Uri>,
    commandContext?: CommandContext
  ): Promise<ProcessResult | undefined> {
    const tfPath = AutoTFSConfiguration.tfPath;
    if (!tfPath) {
      const tfPathError =
        'Auto TFS: TF path is not configured (auto-tfs.tf.path)';

      AutoTFSNotification.info(tfPathError);

      throw new Error(tfPathError);
    }

    const args = command.buildArgs(files, commandContext);

    if (args.length === 0) {
      throw new Error(
        `AutoTFS command "${command.command}". Command produced no arguments to execute`
      );
    }

    const execOpts = command.executionOptions ?? {};

    if (execOpts.detached) {
      this.processExecutor.executeFireAndForget(tfPath, args, {
        useShell: execOpts.useShell,
        detached: execOpts.detached,
        collectOutput: execOpts.collectOutput,
        timeout: execOpts.timeoutMs,
        handlers: {
          onStart: () =>
            AutoTFSLogger.debug(
              `AutoTFS command "${command.command}" Started detached: ${args.join(' ')}`
            ),
          onError: (err: Error) =>
            AutoTFSLogger.error(
              `AutoTFS command "${command.command}" Detached process error: ${err.message}`
            ),
        },
      });

      return undefined;
    }

    // Normal execution: await result and then call handleResult
    const result = await this.processExecutor.execute(tfPath, args, {
      useShell: execOpts.useShell,
      collectOutput: execOpts.collectOutput,
      timeout: execOpts.timeoutMs,
      handlers: {
        onStart: () => {
          const startedMessage = `AutoTFS command "${command.command}" in progress...`;

          AutoTFSLogger.debug(`${startedMessage}. Args: ${args.join(' ')}`);

          if (commandContext?.shouldNotify) {
            AutoTFSNotification.info(startedMessage);
          }
        },
        onStdOut: (d: string) =>
          AutoTFSLogger.debug(
            `AutoTFS command "${command.command}" [stdout] ${d}`
          ),
        onStdErr: (d: string) =>
          AutoTFSLogger.debug(
            `AutoTFS command "${command.command}" [stderr] ${d}`
          ),
        onError: (e: Error) =>
          AutoTFSLogger.error(
            `AutoTFS command "${command.command}" Execution error: ${e.message}`
          ),
      },
    });

    try {
      await command.handleResult(result, files, commandContext);
    } catch (e) {
      if (e instanceof Error) {
        AutoTFSLogger.error(
          `AutoTFS command "${command.command}" Error in handleResult: ${e.message}`
        );
      } else {
        AutoTFSLogger.error(
          `AutoTFS command "${command.command}" Error in handleResult: ${String(e)}`
        );
      }
    }

    return result;
  }
}
