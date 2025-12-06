import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export class ViewCommand implements TfsCommand<Uri, void> {
    public getCommandAndArgs(uri: Uri, config: Configuration): string[] {
        return ['view', uri.fsPath];
    }

    public handleOutput(output: string): void {
        console.log(output);
    }
}
