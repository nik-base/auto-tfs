/**
 * Represents the result of a process execution
 */
export interface ProcessResult {
  /** The exit code from the process */
  readonly exitCode: number;

  /** Standard output as string */
  readonly stdout: string;

  /** Standard error as string */
  readonly stderr: string;

  /** Whether the process succeeded (exitCode === 0) */
  readonly success: boolean;

  /** Command that was executed */
  readonly command: string;

  /** Arguments passed to command */
  readonly args: readonly string[];

  /** Total execution time in milliseconds */
  readonly duration: number;
}
