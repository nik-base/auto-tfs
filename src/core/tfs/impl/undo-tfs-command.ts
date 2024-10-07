import { Uri } from 'vscode';
import { TfsCommandBase } from './tfs-command-base';

export class UndoTfsCommand extends TfsCommandBase {

    public override readonly command = 'undo';

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (!uriList?.length) {
            return [];
        }
        const paths = uriList.map(m => m.fsPath);
        return [this.command, '/recursive', ...paths];
    }
}