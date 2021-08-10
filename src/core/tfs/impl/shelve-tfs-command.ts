import { TfsCommandBase } from './tfs-command-base';
import { SourceControl, Uri } from 'vscode';
import { ProcessHandler } from '../../handler/process-handler';
import { ShelveProcessHandler } from '../../handler/impl/shelve-process-handler';

export class ShelveTfsCommand extends TfsCommandBase {

    public override readonly command = 'shelve';

    private sourceControl?: SourceControl;

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (!_data?.name) {
            return [];
        }
        this.sourceControl = _data?.sourceControl;
        const paths = uriList.map(m => m.fsPath);
        if (_data.replace) {
            return [this.command, '/replace', _data.name, ...paths];
        }
        return [this.command, _data.name, ...paths];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        const handler = new ShelveProcessHandler();
        handler.sourceControl = this.sourceControl;
        return handler;
    }
}