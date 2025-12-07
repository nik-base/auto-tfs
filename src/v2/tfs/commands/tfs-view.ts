// import { ITFSCommand, CommandContext } from '../core/itfs-command';
// import { Uri } from 'vscode';
// import { ProcessResult } from '../core/types';

// export class TFSViewCommand implements ITFSCommand {
//     readonly command = 'view';

//     // View usually opens a GUI; we allow detached usage when requested by caller
//     executionOptions = { collectOutput: false };

//     buildArgs(files: Uri[], data?: any): string[] {
//         if (!files || files.length === 0) return [];
//         const first = files[0];
//         // If a temp output path is provided, use it
//         if (data?.temp) {
//             return [this.command, first.fsPath, `/output:${data.temp}`];
//         }
//         return [this.command, first.fsPath];
//     }

//     async handleResult(result: ProcessResult, _files: Uri[], _data: any, ctx: CommandContext): Promise<void> {
//         if (result.success) {
//             ctx.logger?.info('View completed');
//         } else {
//             ctx.logger?.error(`View failed: ${result.stderr || result.stdout}`);
//             ctx.ui?.showError('View failed.');
//         }
//     }
// }
