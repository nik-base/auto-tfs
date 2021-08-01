import { TfsCommand } from '../tfs_command';
import * as vscode from 'vscode';
import { ProcessHandler } from '../../handler/process_handler';
import { Message } from '../../ui/message';
import { OutputChannel } from '../../output_channel';

export abstract class TfsCommandBase implements TfsCommand {

    private message = new Message();

    public abstract readonly command: string;

    public getCommandAndArgs(): string[] {
        if (!vscode.window.activeTextEditor) {
            const message = 'No active document.';
            this.message.info(message);
            OutputChannel.log(message);
        }
        const activeEditor = vscode.window.activeTextEditor!;
        return this.getCommandAndArgsFile(activeEditor.document.uri, null);
    }

    public getCommandAndArgsFile(uri: vscode.Uri, _data: any): string[] {
        return [this.command, uri.fsPath];
    }

    public abstract getConsoleDataHandler(): ProcessHandler;
}