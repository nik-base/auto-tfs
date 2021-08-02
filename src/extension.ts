import { ExtensionContext, commands, workspace, Uri
    , TextDocumentChangeEvent, TextDocument, FileWillRenameEvent, FileCreateEvent, FileDeleteEvent } from 'vscode';
import { Configuration } from './core/configuration';
import { OutputChannel } from './core/output-channel';
import { Tfs } from './core/tfs';
import { existsSync, lstatSync } from 'fs';

const tfs = new Tfs();
OutputChannel.init();

export function activate(context: ExtensionContext) {

    OutputChannel.log('Auto TFS started');

    const checkoutCommand = commands.registerCommand('auto-tfs.checkout', () => {
        tfs.checkOut();
    });
    const undoCommand = commands.registerCommand('auto-tfs.undo', () => {
        tfs.undo();
    });
    const addCommand = commands.registerCommand('auto-tfs.add', () => {
        tfs.add();
    });
    const deleteCommand = commands.registerCommand('auto-tfs.delete', () => {
        tfs.delete();
    });

    const checkoutExpCommand = commands.registerCommand('auto-tfs.exp-checkout'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const uris = await getRecursiveUris(selectedFiles || [clickedFile]);
        tfs.checkOutFiles(uris);
    });

    const undoExpCommand = commands.registerCommand('auto-tfs.exp-undo'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const uris = await getRecursiveUris(selectedFiles || [clickedFile]);
        tfs.undoFiles(uris);
    });

    const addExpCommand = commands.registerCommand('auto-tfs.exp-add'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const uris = await getRecursiveUris(selectedFiles || [clickedFile]);
        tfs.addFiles(uris);
    });

    const checkoutTileCommand = commands.registerCommand('auto-tfs.tile-checkout'
    , (clickedFile: Uri) => {
        tfs.checkOutFile(clickedFile);
    });

    const undoTileCommand = commands.registerCommand('auto-tfs.tile-undo'
    , (clickedFile: Uri) => {
        tfs.undoFile(clickedFile);
    });

    const addTileCommand = commands.registerCommand('auto-tfs.tile-add'
    , (clickedFile: Uri) => {
        tfs.addFile(clickedFile);
    });

    const checkoutIdeCommand = commands.registerCommand('auto-tfs.ide-checkout'
    , (clickedFile: Uri) => {
        tfs.checkOutFile(clickedFile);
    });

    const undoIdeCommand = commands.registerCommand('auto-tfs.ide-undo'
    , (clickedFile: Uri) => {
        tfs.undoFile(clickedFile);
    });

    const addIdeCommand = commands.registerCommand('auto-tfs.ide-add'
    , (clickedFile: Uri) => {
        tfs.addFile(clickedFile);
    });

    const onChange = workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Change') {
            return;
        }
        tfs.checkOutFile(event.document.uri);
    });

    const onSave = workspace.onDidSaveTextDocument((document: TextDocument) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Save') {
            return;
        }
        tfs.checkOutFile(document.uri);
    });

    const onRename = workspace.onWillRenameFiles((event: FileWillRenameEvent) => {
        return event.waitUntil(tryRenameFiles(event));
    });

    const onCreate = workspace.onDidCreateFiles((event: FileCreateEvent) => {
        const configuration = new Configuration();
        const autoAdd = configuration.isTfAutoAdd();
        if (!autoAdd) {
            return;
        }
        tfs.addFiles(event.files);
    });

    const onDelete = workspace.onDidDeleteFiles((event: FileDeleteEvent) => {
        const configuration = new Configuration();
        const autoDelete = configuration.isTfAutoDelete();
        if (!autoDelete) {
            return;
        }
        tfs.deleteFiles(event.files);
    });

    const getRecursiveUris = async (uris: Uri[]) => {
        let outputUris: Uri[] = [];
        for (let i = 0; i < uris.length; i++) {
            if (existsSync(uris[i].fsPath)) {
                if (lstatSync(uris[i].fsPath).isDirectory()) {
                    outputUris = [...outputUris, ...await workspace.findFiles({
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

    const tryRenameFiles = (event: FileWillRenameEvent): Thenable<any> => {
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