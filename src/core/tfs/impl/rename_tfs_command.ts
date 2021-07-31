import { ProcessHandler } from '../../handler/process_handler';
import { RenameProcessHandler } from '../../handler/impl/rename_process_handler';
import { TfsCommandBase } from './tfs_command_base';
import * as vscode from 'vscode';

export class RenameTfsCommand extends TfsCommandBase {

    protected override readonly command = 'rename';

    public override getCommandAndArgsFile(uri: vscode.Uri, _data: any): string[] {
        const newUri = _data as vscode.Uri;
        return [this.command, uri.fsPath, newUri.fsPath];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        return new RenameProcessHandler();
    }
}