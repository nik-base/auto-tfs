import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export class UndoCommand implements TfsCommand<Uri[], void> {
    public getCommandAndArgs(uris: Uri[], config: Configuration): string[] {
        const files = uris.map(uri => uri.fsPath);
        return ['undo', ...files];
    }

    public handleOutput(output: string): void {
        console.log(output);
    }
}
