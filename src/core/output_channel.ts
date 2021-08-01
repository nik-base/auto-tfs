import * as vscode from 'vscode'

export class OutputChannel {

    private static outputChannel: vscode.OutputChannel;

    public static init() {
        this.outputChannel = vscode.window.createOutputChannel('Auto TFS');
    }

    public static log(message: string): void {
        this.outputChannel.appendLine(message);
    }

    public static logJson(data: any): void {
        this.outputChannel.appendLine(JSON.stringify(data));
    }
}