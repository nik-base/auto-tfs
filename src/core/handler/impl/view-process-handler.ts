import { OutputChannel } from '../../output-channel';
import { commands, Uri } from 'vscode';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

export class ViewProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public tempUri!: Uri;
    public uri!: Uri;

    public override handleExit(exitCode: number): void {
        if (this.tempUri && this.uri) {
            this.openDiff();
        }
        super.handleExit(exitCode);
    }

    private openDiff(): void {
        commands.executeCommand('vscode.diff', this.uri, this.tempUri, 'Compare')
        .then(() => {})
        .then(undefined, err => {
            console.log(err);
            OutputChannel.log(err);
        });
    }
}