import { TfsCommand } from '../tfs-command';
import { Uri } from 'vscode';
import { ProcessHandler } from '../../handler/process-handler';
import { CommonProcessHandler } from '../../handler/impl/common-process-handler';

export abstract class TfsCommandBase implements TfsCommand {

    public abstract readonly command: string;

    public getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        const paths = uriList.map(m => m.fsPath);
        return [this.command, '/recursive', ...paths];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new CommonProcessHandler();
    }
}