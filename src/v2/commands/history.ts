import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export class HistoryCommand implements TfsCommand<Uri, void> {
    public shell = true;

    public getCommandAndArgs(uri: Uri, config: Configuration): string[] {
        return ['history', uri.fsPath];
    }

    public handleOutput(output: string): void {
        console.log(output);
    }
}
