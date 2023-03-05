import { Uri } from 'vscode';
import { TfsCommandBase } from './tfs-command-base';

export class HistoryTfsCommand extends TfsCommandBase {

    public override readonly command = 'history';

    // public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
    //     if (!uriList?.length) {
    //         return [];
    //     }
    //     if (new Configuration().tfCheckin() === 'Without Prompt') {
    //         const escapedPath = uriList.map(m => decodeURI(m.fsPath));
    //         return [this.command, `/comment:"${_data.comment}"`, '/noprompt', ...escapedPath];
    //     }
    //     const paths = uriList.map(m => `"${m.fsPath}"`);
    //     return [this.command, `/comment:"${_data.comment}"`, ...paths];
    //}
}