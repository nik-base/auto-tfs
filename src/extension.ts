import * as vscode from 'vscode';
import { Tfs } from './core/tfs';

var tfs = new Tfs();

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('z-tf-checkout.checkout', () => {
		
		try {
			tfs.checkOut();
		} catch (e) {
			console.log(e);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}