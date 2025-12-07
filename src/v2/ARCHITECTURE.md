/**
 * V2 ARCHITECTURE DOCUMENTATION
 * 
 * This document explains the new modular, async-first architecture for auto-tfs
 * 
 * ============================================================================
 * PROBLEM WITH OLD ARCHITECTURE
 * ============================================================================
 * 
 * Old Flow:
 *   User clicks command → extension.ts registers callback
 *   → Tfs.checkOut() is called
 *   → Process.spawnSync() blocks the entire VS Code UI
 *   → Handler processes output via callbacks
 *   → No clear error handling
 *   → Hard to test (dependencies are instantiated inside)
 * 
 * Issues:
 * - UI Blocking: spawnSync() freezes VS Code while waiting
 * - Tight Coupling: Tfs class handles everything (command logic, execution, UI)
 * - Hard to Test: Can't mock dependencies
 * - Fire-and-Forget Commands: Require special handling with explicit branching
 * - Memory Leaks: Callback handlers may not always be cleaned up
 * - Hard to Maintain: Large Tfs class (~473 lines) mixes concerns
 * 
 * ============================================================================
 * NEW ARCHITECTURE (V2)
 * ============================================================================
 * 
 * Layer 1: PROCESS EXECUTION (ProcessExecutor)
 * ─────────────────────────────────────────────
 * Purpose: Wrap native child_process.spawn() with Promise-based API
 * File: src/v2/process/ProcessExecutor.ts
 * 
 * Features:
 * - async execute(): Returns Promise<ProcessResult>
 * - executeFireAndForget(): Starts process but doesn't wait for result
 * - Event handlers (onStdOut, onStdErr, onExit, etc.)
 * - Automatic timeout handling
 * - Automatic cleanup of resources
 * - Proper error propagation
 * 
 * Used By: CommandExecutor
 * Testable: ✅ Easy to mock
 * 
 * 
 * Layer 2: COMMAND ABSTRACTION (ICommand & Implementations)
 * ──────────────────────────────────────────────────────────
 * Purpose: Define what a command is and how it builds arguments
 * Files: src/v2/commands/ICommand.ts, src/v2/commands/Commands.ts
 * 
 * Design Pattern: Strategy Pattern
 * Each command is a simple class containing:
 * - Command metadata (id, displayName, tfCommand)
 * - buildArgs(): Convert files to TF CLI arguments
 * - isFireAndForget(): Whether to wait for completion
 * - requiresConfirmation(): Whether to ask user
 * - getConfirmationMessage(): The message to show
 * 
 * Benefits:
 * - Lightweight: No dependencies, pure logic
 * - Easy to extend: Add new command by extending BaseCommand
 * - Easy to test: Just test the buildArgs() logic
 * - Reusable: Same command can be used from different contexts
 * 
 * Example:
 *   const cmd = new CheckoutCommand();
 *   const args = cmd.buildArgs([file1, file2]);  // Returns: ['checkout', '/path/to/file1', ...]
 * 
 * Testable: ✅ Very easy to test
 * 
 * 
 * Layer 3: COMMAND EXECUTION (CommandExecutor)
 * ──────────────────────────────────────────────
 * Purpose: Orchestrate command execution with logging and error handling
 * File: src/v2/commands/CommandExecutor.ts
 * 
 * Responsibilities:
 * - Take a command and files
 * - Log the execution
 * - Handle success/error
 * - Report progress to UI
 * 
 * Key Methods:
 * - execute(command, files): Execute with error handling
 * - executeFireAndForget(command, files): Start without waiting
 * - cancel(): Cancel running process
 * 
 * Dependency Injection:
 * - Receives tfPath (executable path)
 * - Receives logger (ICommandLogger)
 * - Receives uiProvider (ICommandUIProvider)
 * 
 * This allows easy testing by passing mock implementations:
 *   const mockLogger = { debug: () => {}, info: () => {}, error: () => {} };
 *   const executor = new CommandExecutor('/path/to/tf', mockLogger, mockUi);
 * 
 * Testable: ✅ Easy to test with mock dependencies
 * 
 * 
 * Layer 4: HIGH-LEVEL SERVICE (TfsServiceV2)
 * ──────────────────────────────────────────
 * Purpose: Main entry point for extension, handles confirmation and coordination
 * File: src/v2/services/TfsServiceV2.ts
 * 
 * Key Methods:
 * - executeWithConfirmation(command, files): Ask user before executing
 * - executeWithoutConfirmation(command, files): Execute immediately
 * - cancel(): Cancel any running operation
 * 
 * Implements:
 * - ICommandLogger: Logging functionality
 * - ICommandUIProvider: UI feedback (messages, progress)
 * 
 * Used By: extension.ts command handlers
 * 
 * Testable: ✅ Can be tested with mock logger and UI provider
 * 
 * ============================================================================
 * CONTROL FLOW COMPARISON
 * ============================================================================
 * 
 * OLD SYNC APPROACH (blocking):
 * ─────────────────────────────
 *   User clicks → tfs.checkOut() 
 *   → Process.spawnSync() ════════════════> BLOCKED UI
 *   → Handlers process output
 *   → Control returns
 *   
 *   Problem: UI frozen while waiting for process
 * 
 * 
 * NEW ASYNC APPROACH (non-blocking):
 * ──────────────────────────────────
 *   User clicks → tfsService.executeWithConfirmation()
 *   → Show confirmation dialog (non-blocking)
 *   → commandExecutor.execute()
 *   → processExecutor.execute()
 *   → spawn() ─────────────┐
 *                          │ (process runs in background)
 *   → Return Promise  <────┘
 *   → await in handler
 *   
 *   VS Code UI remains responsive! ✓
 * 
 * ============================================================================
 * DEPENDENCY INJECTION PATTERN
 * ============================================================================
 * 
 * Instead of:
 *   class Tfs {
 *     private logger = new Logger();        // Hard to test
 *     private message = new Message();      // Hard to test
 *     private configuration = new Configuration();  // Hard to test
 *   }
 * 
 * We use:
 *   class CommandExecutor {
 *     constructor(
 *       private logger: ICommandLogger,     // Easy to mock
 *       private uiProvider: ICommandUIProvider  // Easy to mock
 *     ) {}
 *   }
 * 
 * Benefits:
 * - Easy to test: Pass mock implementations
 * - Flexible: Can have different implementations (UI vs non-UI)
 * - Decoupled: CommandExecutor doesn't depend on concrete classes
 * 
 * ============================================================================
 * FILE STRUCTURE
 * ============================================================================
 * 
 * src/v2/
 * ├── process/
 * │   ├── ProcessExecutor.ts    (Async process execution wrapper)
 * │   └── types.ts              (ProcessResult, ProcessEventHandlers, etc.)
 * │
 * ├── commands/
 * │   ├── ICommand.ts           (Interface + BaseCommand class)
 * │   ├── CommandExecutor.ts    (Orchestrates execution)
 * │   ├── Commands.ts           (All concrete command implementations)
 * │   └── CommandRegistry.ts    (TODO: Easy lookup of commands by id)
 * │
 * ├── handlers/
 * │   ├── ProcessHandler.ts     (TODO: Handler for specific command types)
 * │   └── types.ts
 * │
 * ├── services/
 * │   └── TfsServiceV2.ts       (Main entry point, high-level API)
 * │
 * ├── utils/
 * │   └── logger.ts             (TODO: Proper logging with levels)
 * │
 * └── activation.ts             (How to use in extension.ts)
 * 
 * ============================================================================
 * HOW TO USE (IN EXTENSION.TS)
 * ============================================================================
 * 
 * // In activate()
 * const tfsService = new TfsServiceV2(config.getTfPath());
 * 
 * // Register a command
 * commands.registerCommand('auto-tfs.checkout', async (file, files) => {
 *     const selected = getFiles(file, files);
 *     if (!selected) return;
 *     
 *     try {
 *         // This is fully async and non-blocking!
 *         await tfsService.executeWithConfirmation(
 *             new CheckoutCommand(),
 *             selected
 *         );
 *     } catch (error) {
 *         console.error('Checkout failed:', error);
 *     }
 * });
 * 
 * ============================================================================
 * FIRE-AND-FORGET COMMANDS
 * ============================================================================
 * 
 * Some TFS commands open their own GUI window (history, view, diff)
 * 
 * OLD APPROACH:
 *   The Tfs class had to explicitly handle them differently
 *   Required special ProcessHandler implementations
 *   Hard to reason about control flow
 * 
 * NEW APPROACH:
 *   The command itself declares: isFireAndForget() { return true; }
 *   The service automatically uses executeFireAndForget()
 *   No special handler logic needed
 * 
 * Example:
 *   class HistoryCommand extends BaseCommand {
 *       isFireAndForget() { return true; }
 *       // ... rest of implementation
 *   }
 *   
 *   // Usage - looks the same whether fire-and-forget or not!
 *   await tfsService.executeWithoutConfirmation(new HistoryCommand(), [file]);
 * 
 * ============================================================================
 * TESTING EXAMPLES
 * ============================================================================
 * 
 * Testing ProcessExecutor:
 * ───────────────────────
 *   const executor = new ProcessExecutor();
 *   const result = await executor.execute('echo', ['hello']);
 *   expect(result.success).toBe(true);
 *   expect(result.stdout).toContain('hello');
 * 
 * Testing ICommand:
 * ────────────────
 *   const cmd = new CheckoutCommand();
 *   const args = cmd.buildArgs([Uri.file('file.txt')]);
 *   expect(args).toEqual(['checkout', 'file.txt']);
 *   expect(cmd.requiresConfirmation()).toBe(true);
 * 
 * Testing CommandExecutor:
 * ──────────────────────
 *   const mockLogger = { debug: jest.fn(), info: jest.fn(), error: jest.fn() };
 *   const mockUI = { showProgress: jest.fn(), showSuccess: jest.fn(), showError: jest.fn() };
 *   const executor = new CommandExecutor('/tf', mockLogger, mockUI);
 *   
 *   await executor.execute(new CheckoutCommand(), [file]);
 *   expect(mockLogger.info).toHaveBeenCalled();
 * 
 * ============================================================================
 * MIGRATION STRATEGY
 * ============================================================================
 * 
 * Phase 1: ✅ DONE - Create core async foundation
 *   - ProcessExecutor
 *   - ICommand interface
 *   - CommandExecutor
 *   - TfsServiceV2
 *   - Basic command implementations
 * 
 * Phase 2: TODO - Integrate with existing systems
 *   - Connect to OutputChannel
 *   - Connect to Logger
 *   - Connect to StatusBar
 *   - Connect to SCM (file decorators, groups)
 *   - Create command registry
 * 
 * Phase 3: TODO - Migrate command handlers
 *   - Implement specific handlers for status, checkin, shelve, etc.
 *   - Parse command outputs
 *   - Update UI based on results
 * 
 * Phase 4: TODO - Switch extension activation
 *   - Update extension.ts to use TfsServiceV2
 *   - Keep old code for reference
 *   - Test thoroughly
 *   - Remove old code once stable
 * 
 * Phase 5: TODO - Add tests
 *   - Unit tests for each layer
 *   - Integration tests
 *   - E2E tests
 * 
 * ============================================================================
 * NEXT STEPS
 * ============================================================================
 * 
 * 1. Compile the new code and fix any type errors
 * 2. Create CommandRegistry for looking up commands by id
 * 3. Integrate with existing OutputChannel and Logger
 * 4. Create handlers for special commands (status, checkin, shelve)
 * 5. Test with a few commands first
 * 6. Gradually migrate remaining commands\n * 7. Add proper logging and monitoring
 */
