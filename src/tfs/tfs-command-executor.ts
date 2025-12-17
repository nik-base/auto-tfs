import { ITFSCommand } from './itfs-command';
import { ProcessExecutor } from '../process/process-executor';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';
import { Uri } from 'vscode';
import { AutoTFSLogger } from '../core/autotfs-logger';
import { CommandContext, ProcessResult } from '../models';
import { AutoTFSNotification } from '../core/autotfs-notification';
import { unAuthorizedEvent } from '../extension';

/**
 * Responsible for running ITFSCommand implementations using ProcessExecutor
 */
export class TFSCommandExecutor {
  private readonly processExecutor: ProcessExecutor;

  private readonly suppressedErrors: readonly string[] = [
    'local echo',
    'Access denied',
  ];

  constructor(processExecutor: ProcessExecutor) {
    this.processExecutor = processExecutor;
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
    files?: readonly Uri[],
    context?: CommandContext
  ): Promise<ProcessResult | undefined> {
    const tfPath = AutoTFSConfiguration.tfPath;
    if (!tfPath) {
      const tfPathError =
        'Auto TFS: TF path is not configured (auto-tfs.tf.path)';

      AutoTFSLogger.error(tfPathError);

      AutoTFSNotification.error(tfPathError);

      return;
    }

    const commandContext: CommandContext = {
      shouldNotify: false,
      ...command.context,
      ...context,
    };

    const args: readonly string[] = await command.buildArgs(
      files,
      commandContext
    );

    if (args.length === 0) {
      const tfPathError = `AutoTFS command "${command.command}" produced no arguments to execute`;

      AutoTFSLogger.error(tfPathError);

      AutoTFSNotification.error(tfPathError);

      return;
    }

    const execOpts = command.executionOptions ?? {};

    if (execOpts.detached) {
      try {
        this.startDetachedProcess(
          tfPath,
          args,
          execOpts,
          command,
          commandContext
        );

        return undefined;
      } catch (e: unknown) {
        if (e instanceof Error) {
          AutoTFSLogger.error(
            `AutoTFS command "${command.command}" Error in handleResult: ${e.message}`
          );

          if (e.cause === 'INVALID_CMD') {
            this.notifyInvalidTFPathError(command);
          }
        } else {
          AutoTFSLogger.error(
            `AutoTFS command "${command.command}" Error in handleResult: ${String(e)}`
          );
        }
      }
    }

    AutoTFSLogger.debug(
      `AutoTFS command "${command.command}" starting...Args: ${args.join(' ')}`
    );

    try {
      const result = await this.startProcess(
        tfPath,
        args,
        execOpts,
        command,
        commandContext
      );

      try {
        await command.handleResult(result, files, commandContext);
      } catch (e: unknown) {
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        AutoTFSLogger.error(
          `AutoTFS command "${command.command}" Error in handleResult: ${e.message}`
        );

        if (e.cause === 'INVALID_CMD') {
          this.notifyInvalidTFPathError(command);
        }
      } else {
        AutoTFSLogger.error(
          `AutoTFS command "${command.command}" Error in handleResult: ${String(e)}`
        );
      }

      return;
    }
  }

  private async startProcess(
    tfPath: string,
    args: readonly string[],
    execOpts: {
      useShell?: boolean;
      detached?: boolean;
      collectOutput?: boolean;
      timeoutMs?: number;
    },
    command: ITFSCommand,
    commandContext: CommandContext
  ) {
    return await this.processExecutor.execute(tfPath, args, {
      useShell: execOpts.useShell,
      collectOutput: execOpts.collectOutput,
      timeout: execOpts.timeoutMs,
      handlers: {
        onStart: () => {
          AutoTFSLogger.debug(
            `AutoTFS command "${command.command}" started. Args: ${args.join(' ')}`
          );

          if (commandContext.shouldNotify) {
            AutoTFSNotification.info(
              `Auto TFS: Command "${command.command}" is in progress...`
            );
          }

          command.onStart();
        },
        onStdOut: (d: string) => {
          AutoTFSLogger.debug(
            `AutoTFS command "${command.command}" [stdout] ${d}`
          );

          command.onCommandOutput(d);
        },
        onStdErr: (d: string) => {
          AutoTFSLogger.debug(
            `AutoTFS command "${command.command}" [stderr] ${d}`
          );

          if (d.includes('TF30063')) {
            unAuthorizedEvent.fire();
          }

          command.onCommandError(d);
        },
        onError: (e: Error) => {
          AutoTFSLogger.error(
            `AutoTFS command "${command.command}" Execution error: ${e.message}`
          );

          if (commandContext.shouldNotify && !this.isSuppressedError(e)) {
            AutoTFSNotification.error(
              `Auto TFS: Command "${command.command}" failed. Error: ${e.message}`
            );
          }

          command.onError(e);
        },
        onSuccess: (exitCode: number) => {
          AutoTFSLogger.debug(`AutoTFS command "${command.command}" success`);

          command.onSuccess(exitCode);
        },
        onComplete: () => {
          command.onComplete();
        },
      },
    });
  }

  private notifyInvalidTFPathError(command: ITFSCommand): void {
    const message = `Auto TFS: Command "${command.command}" can't be found. Please, check the property auto-tfs.tf.path in VS Code settings`;

    AutoTFSLogger.error(message);

    AutoTFSNotification.error(message);
  }

  private startDetachedProcess(
    tfPath: string,
    args: readonly string[],
    execOpts: {
      useShell?: boolean;
      detached?: boolean;
      collectOutput?: boolean;
      timeoutMs?: number;
    },
    command: ITFSCommand,
    commandContext: CommandContext
  ): void {
    this.processExecutor.executeFireAndForget(tfPath, args, {
      useShell: execOpts.useShell,
      detached: execOpts.detached,
      collectOutput: execOpts.collectOutput,
      timeout: execOpts.timeoutMs,
      handlers: {
        onStart: () => {
          AutoTFSLogger.debug(
            `AutoTFS command "${command.command}" Started detached. Args: ${args.join(' ')}`
          );

          if (commandContext.shouldNotify) {
            AutoTFSNotification.info(
              `Auto TFS: Command "${command.command}" started in detached mode.`
            );
          }

          command.onStart();
        },
        onError: (err: Error) => {
          AutoTFSLogger.error(
            `AutoTFS command "${command.command}" Detached process error: ${err.message}`
          );

          if (commandContext.shouldNotify && !this.isSuppressedError(err)) {
            AutoTFSNotification.error(
              `Auto TFS: Command "${command.command}" failed to start in detached mode.`
            );
          }

          command.onError(err);
        },
      },
    });
  }

  private isSuppressedError(error: Error): boolean {
    const errorMessage: string = error.toString();

    return this.suppressedErrors.some(
      (item: string): boolean => errorMessage.indexOf(item) > -1
    );
  }
}
