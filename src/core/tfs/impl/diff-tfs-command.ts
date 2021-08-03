import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';

export class DiffTfsCommand extends TfsCommandBase {

    public override readonly command = 'diff';

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (uriList.length < 1) {
            return [];
        }
        const uri = uriList[0] as Uri;
        return [this.command, `"${uri.fsPath}"`, '/format:visual'];
    }
}