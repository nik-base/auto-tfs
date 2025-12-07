// /**
//  * V2 Extension Activation
//  * 
//  * This demonstrates how to use the new async-first architecture
//  * compared to the old synchronous approach in extension.ts
//  * 
//  * Advantages:
//  * - All process execution is truly async (non-blocking UI)
//  * - Clear separation of concerns (command definition, execution, error handling)
//  * - Easy to test: each layer is independently testable
//  * - Easy to extend: add new commands by extending BaseCommand
//  * - Better error handling with proper Promise chains
//  * - Support for fire-and-forget commands without explicit branching
//  */

// import { ExtensionContext, commands, Uri } from 'vscode';
// import { ConfigurationV2 } from './core/configuration';
// import { CommandRunner } from './core/command-executor';
// import { TFSCheckoutCommand } from './commands/tfs-checkout';
// import { TFSStatusCommand } from './commands/tfs-status';
// import { TFSViewCommand } from './commands/tfs-view';
// import { TFSHistoryCommand } from './commands/tfs-history';

// /**
//  * Initialize V2 TFS service with all command handlers
//  */
// export function activateV2(context: ExtensionContext): void {
//     const config = ConfigurationV2.get();
//     const tfPath = config.getTfPath();

//     if (!tfPath) {
//         console.warn('TF path not configured. Extension features will not work.');
//         return;
//     }

//     const runner = new CommandRunner();

//     // ===== Register Commands =====
//     // Each command registration is now a simple, testable function

//     const checkoutCmd = commands.registerCommand(
//         'auto-tfs.checkout',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 await runner.run(new TFSCheckoutCommand(), files, null, { tfPath });
//             } catch (error) {
//                 console.error('Checkout command failed:', error);
//             }
//         }
//     );

//     const undoCmd = commands.registerCommand(
//         'auto-tfs.undo',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 await runner.run(new TFSCheckoutCommand(), files, null, { tfPath });
//             } catch (error) {
//                 console.error('Undo command failed:', error);
//             }
//         }
//     );

//     const addCmd = commands.registerCommand(
//         'auto-tfs.add',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 await runner.run(new TFSCheckoutCommand(), files, null, { tfPath });
//             } catch (error) {
//                 console.error('Add command failed:', error);
//             }
//         }
//     );

//     const deleteCmd = commands.registerCommand(
//         'auto-tfs.delete',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 await runner.run(new TFSCheckoutCommand(), files, null, { tfPath });
//             } catch (error) {
//                 console.error('Delete command failed:', error);
//             }
//         }
//     );

//     const getCmd = commands.registerCommand(
//         'auto-tfs.get',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 await runner.run(new TFSStatusCommand(), files, null, { tfPath });
//             } catch (error) {
//                 console.error('Get command failed:', error);
//             }
//         }
//     );

//     const historyCmd = commands.registerCommand(
//         'auto-tfs.history',
//         async (clickedFile: Uri) => {
//             if (!clickedFile) return;
//             try {
//                 // Fire-and-forget command - no confirmation needed
//                 await runner.run(new TFSHistoryCommand(), [clickedFile], null, { tfPath });
//             } catch (error) {
//                 console.error('History command failed:', error);
//             }
//         }
//     );

//     const viewCmd = commands.registerCommand(
//         'auto-tfs.view',
//         async (clickedFile: Uri) => {
//             if (!clickedFile) return;
//             try {
//                 // Fire-and-forget command
//                 await runner.run(new TFSViewCommand(), [clickedFile], null, { tfPath });
//             } catch (error) {
//                 console.error('View command failed:', error);
//             }
//         }
//     );

//     const diffCmd = commands.registerCommand(
//         'auto-tfs.diff',
//         async (clickedFile: Uri) => {
//             if (!clickedFile) return;
//             try {
//                 // Fire-and-forget command
//                 await runner.run(new TFSViewCommand(), [clickedFile], null, { tfPath });
//             } catch (error) {
//                 console.error('Diff command failed:', error);
//             }
//         }
//     );

//     const statusCmd = commands.registerCommand(
//         'auto-tfs.status',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 const result = await runner.run(new TFSStatusCommand(), files, null, { tfPath });
//                 if (result?.success) {
//                     console.log('Status output:', result.stdout);
//                 }
//             } catch (error) {
//                 console.error('Status command failed:', error);
//             }
//         }
//     );

//     const infoCmd = commands.registerCommand(
//         'auto-tfs.info',
//         async (clickedFile: Uri, selectedFiles: Uri[]) => {
//             const files = getFiles(clickedFile, selectedFiles);
//             if (!files) return;
//             try {
//                 const result = await runner.run(new TFSStatusCommand(), files, null, { tfPath });
//                 if (result?.success) {
//                     console.log('Info output:', result.stdout);
//                 }
//             } catch (error) {
//                 console.error('Info command failed:', error);
//             }
//         }
//     );

//     // Subscribe disposables
//     context.subscriptions.push(
//         checkoutCmd,
//         undoCmd,
//         addCmd,
//         deleteCmd,
//         getCmd,
//         historyCmd,
//         viewCmd,
//         diffCmd,
//         statusCmd,
//         infoCmd
//     );
// }

// /**
//  * Helper to get selected files from context menu
//  */
// function getFiles(clickedFile: Uri | undefined, selectedFiles: Uri[] | undefined): Uri[] | null {
//     if (!clickedFile && !selectedFiles) {
//         return null;
//     }

//     if (selectedFiles && selectedFiles.length > 0) {
//         return selectedFiles;
//     }

//     return clickedFile ? [clickedFile] : null;
// }
