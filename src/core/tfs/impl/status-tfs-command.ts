import { ProcessHandler } from '../../handler/process-handler';
import { StatusProcessHandler } from '../../handler/impl/status-process-handler';
import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';

export class StatusTfsCommand extends TfsCommandBase {

    public override readonly command = 'status';

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        return [this.command, '/format:detailed', uriList[0].fsPath, '/recursive'];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        return new StatusProcessHandler();
    }
}