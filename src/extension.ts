import * as vscode from 'vscode';
import { Configuration } from './core/configuration';
import { Tfs } from './core/tfs';

let tfs = new Tfs();

export function activate(context: vscode.ExtensionContext) {
    
    let checkoutCommand = vscode.commands.registerCommand('auto-tfs.checkout', () => {
        tfs.checkOut();
    });
    let undoCommand = vscode.commands.registerCommand('auto-tfs.undo', () => {
        tfs.undo();
    });
    let addCommand = vscode.commands.registerCommand('auto-tfs.add', () => {
        tfs.add();
    });
    let deleteCommand = vscode.commands.registerCommand('auto-tfs.delete', () => {
        tfs.delete();
    });

    let onChange = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Change') {
            return;
        }   
        tfs.checkOutFile(event.document.uri);
	});

    let onSave = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Save') {
            return;
        }
		tfs.checkOutFile(document.uri);    
	});

    let onRename = vscode.workspace.onDidRenameFiles((event: vscode.FileRenameEvent) => {
        const configuration = new Configuration();
        const autoRename = configuration.isTfAutoRename();
        if (!autoRename) {
            return;
        }
        tfs.renameFiles(event.files);
	});

    let onCreate = vscode.workspace.onDidCreateFiles((event: vscode.FileCreateEvent) => {
        const configuration = new Configuration();
        const autoAdd = configuration.isTfAutoAdd();
        if (!autoAdd) {
            return;
        }
        tfs.addFiles(event.files);
	});

    let onDelete = vscode.workspace.onDidDeleteFiles((event: vscode.FileDeleteEvent) => {
        const configuration = new Configuration();
        const autoDelete = configuration.isTfAutoDelete();
        if (!autoDelete) {
            return;
        }
        tfs.deleteFiles(event.files);
	});

    context.subscriptions.push(
        checkoutCommand,
        undoCommand,
        addCommand,
        deleteCommand,
        onChange,
        onRename,
        onSave,
        onCreate,
        onDelete);
}

// this method is called when your extension is deactivated
export function deactivate() { }