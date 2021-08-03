import { ProcessHandler } from '../handler/process-handler';
import { Uri } from 'vscode';

export interface TfsCommand {
    command: string;
    getCommandAndArgs(uriList: readonly Uri[], _data: any): string[];
    getConsoleDataHandler(): ProcessHandler;
}