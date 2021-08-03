import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';

export class RenameTfsCommand extends TfsCommandBase {

    public override readonly command = 'rename';

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (uriList.length < 2) {
            return [];
        }
        const oldUri = uriList[0] as Uri;
        const newUri = uriList[1] as Uri;
        return [this.command, oldUri.fsPath, newUri.fsPath];
    }
}