import { window, OutputChannel as vscodeOutputChannel } from 'vscode';

export class OutputChannel {

    private static outputChannel: vscodeOutputChannel;

    public static init(): vscodeOutputChannel {
        this.outputChannel = window.createOutputChannel('Auto TFS');
        return this.outputChannel;
    }

    public static log(message: string): void {
        this.outputChannel.appendLine(message);
    }

    public static logJson(data: any): void {
        this.outputChannel.appendLine(JSON.stringify(data));
    }
}