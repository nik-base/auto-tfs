/**
 * Callbacks for process events during execution
 */
export interface ProcessEventHandlers {
  /** Called when stdout data is received */
  readonly onStdOut?: (data: string) => void;

  /** Called when stderr data is received */
  readonly onStdErr?: (data: string) => void;

  /** Called when the process exits */
  readonly onSuccess?: (exitCode: number) => void;

  /** Called when the process encounters an error */
  readonly onError?: (error: Error) => void;

  /** Called when execution starts */
  readonly onStart?: () => void;

  /** Called when execution completes (success or failure) */
  readonly onComplete?: () => void;
}
