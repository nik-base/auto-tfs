// import { ITFSCommand, CommandContext } from '../core/itfs-command';
// import { Uri } from 'vscode';
// import { ProcessResult } from '../core/types';

// export class TFSStatusCommand implements ITFSCommand {
//     readonly command = 'status';

//     buildArgs(files: Uri[]): string[] {
//         if (!files?.length) return [];
//         // Use the first file/folder as root for status
//         const path = files[0].fsPath;
//         return [this.command, '/format:detailed', path, '/recursive'];
//     }

//     async handleResult(result: ProcessResult, files: Uri[], _data: any, ctx: CommandContext): Promise<void> {
//         if (!result) return;
//         if (result.success) {
//             ctx.logger?.info(`Status succeeded for ${files.length} file(s)`);
//             // For now, just log the stdout. Later we will parse and sync with SCM.
//             ctx.logger?.debug(result.stdout);
//             ctx.ui?.showInfo('Status completed');
//         } else {
//             ctx.logger?.error(`Status failed: ${result.stderr || result.stdout}`);
//             ctx.ui?.showError('Status failed. Check output channel for details.');
//         }
//     }
// }
