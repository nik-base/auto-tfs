import * as vscode from 'vscode';

export class Message {
    public info(message: string, ...items: string[]): Thenable<string | undefined> {
        return vscode.window.showInformationMessage(message, ...items);
    }

    public warning(message: string, ...items: string[]): Thenable<string | undefined> {
        return vscode.window.showWarningMessage(message, ...items);
    }

    public error(message: string, ...items: string[]): Thenable<string | undefined> {
        return vscode.window.showErrorMessage(message, ...items);
    }
}