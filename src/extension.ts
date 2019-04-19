import * as vscode from 'vscode';
import { Tfs } from './core/tfs';

var tfs = new Tfs();

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('z-tf-checkout.checkout', () => {
		tfs.checkOut();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}