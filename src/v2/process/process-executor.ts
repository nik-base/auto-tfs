import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import { AutoTFSLogger } from '../core/autotfs-logger';
import {
  ProcessEventHandlers,
  ProcessExecutionOptions,
  ProcessResult,
} from '../models';

interface ProcessExecutionContext {
  readonly childProcess: ChildProcess;
  readonly startTime: number;
}

export class ProcessExecutor {
  private readonly SIGKILL = 'SIGKILL';

  private readonly runningChildProcesses: Map<number, ProcessExecutionContext> =
    new Map<number, ProcessExecutionContext>();

  /**
   * Execute a command asynchronously
   * @param command Executable path (e.g., 'tf', 'git')
   * @param args Arguments to pass to the command
   * @param options Execution options including event handlers
   * @returns Promise resolving to ProcessResult
   */
  async execute(
    command: string,
    args: ReadonlyArray<string>,
    options: ProcessExecutionOptions = {}
  ): Promise<ProcessResult> {
    return new Promise((resolve, reject) => {
      if (!command || typeof command !== 'string') {
        reject(new Error('Command must be a non-empty string'));

        return;
      }

      if (options.detached) {
        try {
          const child = spawn(`"${command}"`, args, {
            detached: true,
            stdio: 'ignore', // Usually desired for fully detached
            cwd: options.cwd,
            env: options.env ? { ...process.env, ...options.env } : process.env,
            shell: options.useShell ?? false,
            timeout: options.timeout,
          });

          child.unref(); // Allow parent to exit independently

          return resolve({
            exitCode: 0,
            stdout: '',
            stderr: '',
            success: true,
            command,
            args,
            duration: 0,
          });
        } catch (error) {
          reject(this.createError(error, command, args));
        }
        return;
      }

      // Reset state for fresh execution
      // this.destroyed = false;
      // this.startTime = Date.now();
      const handlers = options.handlers ?? {};

      try {
        this.startProcess(command, args, options, handlers, resolve, reject);
      } catch (error) {
        reject(this.createError(error, command, args));
      }
    });
  }

  /**
   * Execute a fire-and-forget command (don't wait for completion)
   * Useful for commands that open their own UI (e.g., history)
   * @param command Executable path
   * @param args Arguments to pass to the command
   * @param options Execution options
   */
  executeFireAndForget(
    command: string,
    args: ReadonlyArray<string>,
    options: ProcessExecutionOptions = {}
  ): void {
    this.execute(command, args, options).catch((err: Error) => {
      AutoTFSLogger.warn(`Fire-and-forget process error: ${err.message}`);
    });
  }

  killAll(signal: NodeJS.Signals | number = 'SIGTERM'): void {
    const runningChildProcesses: ProcessExecutionContext[] = Array.from(
      this.runningChildProcesses.values()
    );

    for (const processContext of runningChildProcesses) {
      if (!processContext.childProcess.killed) {
        processContext.childProcess.kill(signal);
      }
    }
  }

  areProcessesRunning(): boolean {
    return this.runningChildProcesses.size > 0;
  }

  destroy(): void {
    this.killAll(this.SIGKILL);
  }

  private startProcess(
    command: string,
    args: ReadonlyArray<string>,
    options: ProcessExecutionOptions,
    handlers: ProcessEventHandlers,
    resolve: (result: ProcessResult) => void,
    reject: (error: Error) => void
  ): number | undefined {
    const stdoutBuffer: string[] = [];
    const stderrBuffer: string[] = [];

    const spawnOptions: SpawnOptions = {
      cwd: options.cwd,
      env: options.env ? { ...process.env, ...options.env } : process.env,
      shell: options.useShell ?? false,
      timeout: options.timeout,
      killSignal: this.SIGKILL,
    };

    const childProcess: ChildProcess = spawn(
      `"${command}"`,
      args,
      spawnOptions
    );

    const pid = childProcess.pid;

    if (!pid) {
      reject(new Error('Failed to start process: PID not available'));

      return undefined;
    }

    const processContext: ProcessExecutionContext = {
      childProcess,
      startTime: Date.now(),
    };

    this.runningChildProcesses.set(pid, processContext);

    handlers.onStart?.();

    this.handleProcessStdOut(childProcess, options, stdoutBuffer, handlers);

    this.handleProcessStdErr(childProcess, options, stderrBuffer, handlers);

    if (options.stdin) {
      this.handleProcessStdIn(childProcess, options);
    }

    this.handleProcessExit(
      childProcess,
      pid,
      processContext,
      handlers,
      stdoutBuffer,
      stderrBuffer,
      command,
      args,
      resolve
    );

    this.handleProcessError(childProcess, pid, handlers, reject);

    return pid;
  }

  private handleProcessStdIn(
    childProcess: ChildProcess,
    options: ProcessExecutionOptions
  ) {
    childProcess.stdin?.write(options.stdin);

    childProcess.stdin?.end();
  }

  private handleProcessStdOut(
    childProcess: ChildProcess,
    options: ProcessExecutionOptions,
    stdoutBuffer: string[],
    handlers: ProcessEventHandlers
  ) {
    childProcess.stdout?.on('data', (data: Buffer) => {
      const str = data.toString();

      if (options.collectOutput !== false) {
        stdoutBuffer.push(str);
      }

      handlers.onStdOut?.(str);
    });
  }

  private handleProcessStdErr(
    childProcess: ChildProcess,
    options: ProcessExecutionOptions,
    stderrBuffer: string[],
    handlers: ProcessEventHandlers
  ) {
    childProcess.stderr?.on('data', (data: Buffer) => {
      const str = data.toString();

      if (options.collectOutput !== false) {
        stderrBuffer.push(str);
      }

      handlers.onStdErr?.(str);
    });
  }

  private handleProcessExit(
    childProcess: ChildProcess,
    pid: number,
    processContext: ProcessExecutionContext,
    handlers: ProcessEventHandlers,
    stdoutBuffer: string[],
    stderrBuffer: string[],
    command: string,
    args: ReadonlyArray<string>,
    resolve: (result: ProcessResult) => void
  ) {
    childProcess.on(
      'close',
      (code: number | null, signal: NodeJS.Signals | null) => {
        this.cleanupProcess(pid);

        const exitCode = this.getProcessExitCode(code, signal);

        const duration = Date.now() - processContext.startTime;

        handlers.onExit?.(exitCode);

        handlers.onComplete?.();

        const result: ProcessResult = {
          exitCode,
          stdout: stdoutBuffer.join(''),
          stderr: stderrBuffer.join(''),
          success: exitCode === 0,
          command,
          args,
          duration,
        };

        // Resolve even on non-zero exit code (caller decides what's an error)
        resolve(result);
      }
    );
  }

  private handleProcessError(
    childProcess: ChildProcess,
    pid: number,
    handlers: ProcessEventHandlers,
    reject: (error: Error) => void
  ): void {
    childProcess.on('error', (error: Error) => {
      this.cleanupProcess(pid);

      handlers.onError?.(error);

      handlers.onComplete?.();

      reject(error);
    });
  }

  private getProcessExitCode(
    code: number | null,
    signal: NodeJS.Signals | null
  ): number {
    if (code !== null) {
      return code;
    }

    if (!signal) {
      return 1;
    }

    if (signal === 'SIGKILL') {
      return 137;
    }

    if (signal === 'SIGTERM') {
      return 143;
    }

    return 1;
  }

  private cleanupProcess(pid: number): void {
    const processContext = this.runningChildProcesses.get(pid);

    if (!processContext) {
      return;
    }

    this.runningChildProcesses.delete(pid);
  }

  private createError(
    error: unknown,
    command: string,
    args: ReadonlyArray<string>
  ): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error(
      `Failed to execute '${command} ${args.join(' ')}': ${String(error)}`
    );
  }
}
