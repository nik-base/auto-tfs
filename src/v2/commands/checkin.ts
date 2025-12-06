import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export interface CheckinItem {
    comment: string;
    uris: Uri[];
}

export class CheckinCommand implements TfsCommand<CheckinItem, void> {
    public shell: boolean;

    constructor(config: Configuration) {
        this.shell = config.tfCheckin() === 'With Prompt';
    }

    public getCommandAndArgs(item: CheckinItem, config: Configuration): string[] {
        const paths = item.uris.map(m => m.fsPath);
        const args = ['checkin', ...paths, `/comment:${item.comment}`];

        if (config.tfCheckin() === 'Without Prompt') {
            args.push('/noprompt');
        }
        
        return args;
    }

    public handleOutput(output: string): void {
        console.log(output);
    }
}
