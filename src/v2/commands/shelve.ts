import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export interface ShelveItem {
    name: string;
    uris: Uri[];
    replace?: boolean;
}

export class ShelveCommand implements TfsCommand<ShelveItem, void> {
    public getCommandAndArgs(item: ShelveItem, config: Configuration): string[] {
        const paths = item.uris.map(m => m.fsPath);
        if (item.replace) {
            return ['shelve', '/replace', item.name, ...paths];
        }
        return ['shelve', item.name, ...paths];
    }

    public handleOutput(output: string): void {
        console.log(output);
    }
}
