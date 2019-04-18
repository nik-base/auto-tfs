import * as vscode from 'vscode';
import * as cp from 'child_process';

var child : cp.ChildProcess;

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('z-tf-checkout.checkout', () => {
		let isLogged = checkOut();
		if (isLogged) {
			vscode.window.showInformationMessage('The file is checked-out successfully');
		} else {
			vscode.window.showInformationMessage('Something wrong during the check-out');
		}
	});


	context.subscriptions.push(disposable);
}

function checkOut() {
	child = cp.spawn("D:\\tools\\tee\\tf.cmd", ["checkout", getAbsolutePath()]);	
	child.stdout.on("data", function(data) {
		console.log("Out");
		console.log(data.toString());
		if (data.toString().startsWith("Username")) {
			enterCredentials();
			console.log(true);
		}
	});
	return !true;
}

function getAbsolutePath(): string {
	return vscode.window.activeTextEditor.document.uri.fsPath;
}

function enterCredentials()
{
	let userInput = vscode.window.showInputBox({
		value: "Enter userName",
		validateInput: function(input) {
			if (input.length == 0) {
				return "Please, provide the user name";
			}
		}
	});
	userInput.then(function(data) {
		child.stdin.write(data);
		child.stdin.write("\n");
		enterPassword();
	});
}

function enterPassword()
{
	let userInput = vscode.window.showInputBox({
		value: "Enter password",
		password: true,
		validateInput: function(input) {
			if (input.length == 0) {
				return "Please, provide the user name";
			}
		}
	});
	userInput.then(function(data) {
		child.stdin.write(data);
		child.stdin.write("\n");
	});	
}

// this method is called when your extension is deactivated
export function deactivate() {}