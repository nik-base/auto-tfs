import { TfsCommand } from '../tfs-command';
import { Uri } from 'vscode';
import { ProcessHandler } from '../../handler/process-handler';
import { CommonProcessHandler } from '../../handler/impl/common-process-handler';
import { lstatSync } from 'fs';

export abstract class TfsCommandBase implements TfsCommand {

    public abstract readonly command: string;

    public displayName = () => this.command;

    public getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (!uriList?.length) {
            return [];
        }
        if (uriList?.length === 1 && uriList[0]?.fsPath && lstatSync(uriList[0]?.fsPath).isDirectory()) {
            return [this.command, '/recursive', uriList[0].fsPath];
        }
        const paths = uriList?.filter(f => f.fsPath && !lstatSync(f.fsPath).isDirectory())?.map(m => m.fsPath);
        if (!paths?.length) {
            return [];
        }
        return [this.command, ...paths];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new CommonProcessHandler();
    }
}