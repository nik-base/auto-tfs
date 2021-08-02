import { window } from 'vscode';

export class Message {
    public info(message: string, ...items: string[]): Thenable<string | undefined> {
        return window.showInformationMessage(message, ...items);
    }

    public warning(message: string, ...items: string[]): Thenable<string | undefined> {
        return window.showWarningMessage(message, ...items);
    }

    public error(message: string, ...items: string[]): Thenable<string | undefined> {
        return window.showErrorMessage(message, ...items);
    }
}