import { OutputChannel, window } from "vscode";

export class AutoTFSOutputChannel {
    private static outputChannel: OutputChannel;

    public static init(): OutputChannel {
        this.outputChannel = window.createOutputChannel('Auto TFS');

        return this.outputChannel;
    }

    public static log(message: string): void {
        this.outputChannel.appendLine(message);
    }

    public static logAny(data: unknown): void {
        this.outputChannel.appendLine(JSON.stringify(data));
    }
}