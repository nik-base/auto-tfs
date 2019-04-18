import * as vscode from 'vscode';
import { CommandRunner } from './core/command_runner';

var commandRunner = new CommandRunner();

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('z-tf-checkout.checkout', () => {
		commandRunner.checkOut();
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}