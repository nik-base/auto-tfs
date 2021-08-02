import { ProcessHandler } from '../../handler/process-handler';
import { RenameProcessHandler } from '../../handler/impl/rename-process-handler';
import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';

export class RenameTfsCommand extends TfsCommandBase {

    public override readonly command = 'rename';

    public override getCommandAndArgsFile(uri: Uri, _data: any): string[] {
        const newUri = _data as Uri;
        return [this.command, uri.fsPath, newUri.fsPath];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        return new RenameProcessHandler();
    }
}