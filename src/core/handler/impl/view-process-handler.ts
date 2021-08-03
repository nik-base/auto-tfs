import { OutputChannel } from '../../output-channel';
import { commands, Uri } from 'vscode';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';
import { ParsedPath } from 'path';

export class ViewProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public parsedTemp!: ParsedPath;
    public uri!: Uri;
    public tempPath!: string;

    public override handleExit(exitCode: number): void {
        if (this.parsedTemp && this.uri) {
            this.openDiff();
        }
        super.handleExit(exitCode);
    }

    private openDiff(): void {
        commands.executeCommand('vscode.diff', Uri.file(this.tempPath), this.uri, `Compare: ${this.parsedTemp.base}`)
        .then(() => {})
        .then(undefined, err => {
            console.log(err);
            OutputChannel.log(err);
        });
    }
}