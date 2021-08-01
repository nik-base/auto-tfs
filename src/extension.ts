import * as vscode from 'vscode';
import { Configuration } from './core/configuration';
import { OutputChannel } from './core/output_channel';
import { Tfs } from './core/tfs';
import * as fs from 'fs';

const tfs = new Tfs();
OutputChannel.init();

export function activate(context: vscode.ExtensionContext) {
    OutputChannel.log('Auto TFS started');
    
    const checkoutCommand = vscode.commands.registerCommand('auto-tfs.checkout', () => {
        tfs.checkOut();
    });
    const undoCommand = vscode.commands.registerCommand('auto-tfs.undo', () => {
        tfs.undo();
    });
    const addCommand = vscode.commands.registerCommand('auto-tfs.add', () => {
        tfs.add();
    });
    const deleteCommand = vscode.commands.registerCommand('auto-tfs.delete', () => {
        tfs.delete();
    });
    
    const checkoutExpCommand = vscode.commands.registerCommand('auto-tfs.exp-checkout'
    , async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const uris = await getRecursiveUris(selectedFiles || [clickedFile]);
        tfs.checkOutFiles(uris);
    });

    const undoExpCommand = vscode.commands.registerCommand('auto-tfs.exp-undo'
    , async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const uris = await getRecursiveUris(selectedFiles || [clickedFile]);
        tfs.undoFiles(uris);
    });

    const addExpCommand = vscode.commands.registerCommand('auto-tfs.exp-add'
    , async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const uris = await getRecursiveUris(selectedFiles || [clickedFile]);
        tfs.addFiles(uris);
    });

    const checkoutTileCommand = vscode.commands.registerCommand('auto-tfs.tile-checkout'
    , (clickedFile: vscode.Uri) => {
        tfs.checkOutFile(clickedFile);
    });

    const undoTileCommand = vscode.commands.registerCommand('auto-tfs.tile-undo'
    , (clickedFile: vscode.Uri) => {
        tfs.undoFile(clickedFile);
    });

    const addTileCommand = vscode.commands.registerCommand('auto-tfs.tile-add'
    , (clickedFile: vscode.Uri) => {
        tfs.addFile(clickedFile);
    });

    const checkoutIdeCommand = vscode.commands.registerCommand('auto-tfs.ide-checkout'
    , (clickedFile: vscode.Uri) => {
        tfs.checkOutFile(clickedFile);
    });

    const undoIdeCommand = vscode.commands.registerCommand('auto-tfs.ide-undo'
    , (clickedFile: vscode.Uri) => {
        tfs.undoFile(clickedFile);
    });

    const addIdeCommand = vscode.commands.registerCommand('auto-tfs.ide-add'
    , (clickedFile: vscode.Uri) => {
        tfs.addFile(clickedFile);
    });

    const onChange = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Change') {
            return;
        }   
        tfs.checkOutFile(event.document.uri);
	});

    const onSave = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Save') {
            return;
        }
		tfs.checkOutFile(document.uri);    
	});

    const onRename = vscode.workspace.onWillRenameFiles((event: vscode.FileWillRenameEvent) => {
        return event.waitUntil(tryRenameFiles(event));
	});

    const onCreate = vscode.workspace.onDidCreateFiles((event: vscode.FileCreateEvent) => {
        const configuration = new Configuration();
        const autoAdd = configuration.isTfAutoAdd();
        if (!autoAdd) {
            return;
        }
        tfs.addFiles(event.files);
	});

    const onDelete = vscode.workspace.onDidDeleteFiles((event: vscode.FileDeleteEvent) => {
        const configuration = new Configuration();
        const autoDelete = configuration.isTfAutoDelete();
        if (!autoDelete) {
            return;
        }
        tfs.deleteFiles(event.files);
	});

    const getRecursiveUris = async (uris: vscode.Uri[]) => {
        let outputUris: vscode.Uri[] = [];
        for (let i = 0; i < uris.length; i++) {
            if (fs.existsSync(uris[i].fsPath)) {
                if (fs.lstatSync(uris[i].fsPath).isDirectory()) {
                    outputUris = [...outputUris, ...await vscode.workspace.findFiles({
                        base: uris[i].path,
                        pattern: '**/*'
                    })];
                    outputUris.push(uris[i]);
                } else {
                    outputUris.push(uris[i]);
                }
            }
        }
        return outputUris;
    };

    const tryRenameFiles = (event: vscode.FileWillRenameEvent): Thenable<any> => {
        try {
            const configuration = new Configuration();
            const autoRename = configuration.isTfAutoRename();
            if (!autoRename) {
                return Promise.resolve();
            }
            return tfs.renameFiles(event.files).then(() => {
            }).then(undefined, _ => {
            });
        } catch {
            return Promise.resolve();
        }
    };

    context.subscriptions.push(
        checkoutCommand,
        undoCommand,
        addCommand,
        deleteCommand,
        onChange,
        onRename,
        onSave,
        onCreate,
        onDelete,
        checkoutExpCommand,
        checkoutTileCommand,
        checkoutIdeCommand,
        undoExpCommand,
        undoTileCommand,
        undoIdeCommand,
        addExpCommand,
        addTileCommand,
        addIdeCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
    OutputChannel.log('Auto TFS stopped');
 }