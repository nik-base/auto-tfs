import { ProcessHandler } from '../../handler/process-handler';
import { InfoProcessHandler } from '../../handler/impl/info-process-handler';
import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';

export class InfoTfsCommand extends TfsCommandBase {

    public override readonly command = 'info';

    private item: string | undefined;

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (!uriList?.length) {
            return [];
        }
        this.item = _data?.item;
        if (_data?.item === 'sourceitem') {
            return ['status', uriList[0].fsPath, '/format:detailed'];
        }
        return [this.command, uriList[0].fsPath];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        const handler = new InfoProcessHandler();
        handler.item = this.item;
        return handler;
    }
}