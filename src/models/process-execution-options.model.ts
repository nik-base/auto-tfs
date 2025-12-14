import { ProcessEventHandlers } from './process-event-handler.model';

/**
 * Options for process execution
 */
export interface ProcessExecutionOptions {
  /** Current working directory for the process */
  readonly cwd?: string;

  /** Environment variables to pass to the process */
  readonly env?: NodeJS.ProcessEnv;

  /** Whether to use shell to execute the command */
  readonly useShell?: boolean;

  /** Input to write to stdin */
  readonly stdin?: string;

  /** Event handlers for process lifecycle */
  readonly handlers?: ProcessEventHandlers;

  /** Timeout in milliseconds (0 = no timeout) */
  readonly timeout?: number;

  /** Whether to collect output or stream it */
  readonly collectOutput?: boolean;

  /** Whether to detach the process (don't wait for completion) */
  readonly detached?: boolean;
}
