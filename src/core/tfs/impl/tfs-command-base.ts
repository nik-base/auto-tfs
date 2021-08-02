import { TfsCommand } from '../tfs-command';
import { window, Uri } from 'vscode';
import { ProcessHandler } from '../../handler/process-handler';
import { Message } from '../../ui/message';
import { OutputChannel } from '../../output-channel';

export abstract class TfsCommandBase implements TfsCommand {

    private message = new Message();

    public abstract readonly command: string;

    public getCommandAndArgs(): string[] {
        if (!window.activeTextEditor) {
            const message = 'No active document.';
            this.message.info(message);
            OutputChannel.log(message);
        }
        const activeEditor = window.activeTextEditor!;
        return this.getCommandAndArgsFile(activeEditor.document.uri, null);
    }

    public getCommandAndArgsFile(uri: Uri, _data: any): string[] {
        return [this.command, uri.fsPath];
    }

    public abstract getConsoleDataHandler(): ProcessHandler;
}