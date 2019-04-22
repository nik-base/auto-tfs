import * as vscode from 'vscode';
import { Tfs } from './core/tfs';

let tfs = new Tfs();

export function activate(context: vscode.ExtensionContext) {
    let checkoutCommand = vscode.commands.registerCommand('z-tf-util.checkout', () => {
        tfs.checkOut();
    });
    let undoCommand = vscode.commands.registerCommand('z-tf-util.undo', () => {
        tfs.undo();
    });
    let addCommand = vscode.commands.registerCommand('z-tf-util.add', () => {
        tfs.add();
    });
    let deleteCommand = vscode.commands.registerCommand('z-tf-util.delete', () => {
        tfs.delete();
    });

    context.subscriptions.push(
        checkoutCommand,
        undoCommand,
        addCommand,
        deleteCommand);
}

// this method is called when your extension is deactivated
export function deactivate() { }