import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export interface RenameItem {
    oldUri: Uri;
    newUri: Uri;
}

export class RenameCommand implements TfsCommand<RenameItem, void> {
    public getCommandAndArgs(item: RenameItem, config: Configuration): string[] {
        return ['rename', item.oldUri.fsPath, item.newUri.fsPath];
    }

    public handleOutput(output: string): void {
        console.log(output);
    }
}
