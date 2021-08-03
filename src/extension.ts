import { Message } from './core/ui/message';
import { ExtensionContext, commands, workspace, Uri, window, TextEditor
    , TextDocumentChangeEvent, TextDocument, FileWillRenameEvent, FileCreateEvent, FileDeleteEvent } from 'vscode';
import { Configuration } from './core/configuration';
import { OutputChannel } from './core/output-channel';
import { Tfs } from './core/tfs';

const tfs = new Tfs();
OutputChannel.init();

export function activate(context: ExtensionContext) {

    OutputChannel.log('Auto TFS started');

    const checkoutCommand = commands.registerCommand('auto-tfs.checkout', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.checkOut([editor.document.uri]);
    });

    const undoCommand = commands.registerCommand('auto-tfs.undo', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.undo([editor.document.uri]);
    });

    const addCommand = commands.registerCommand('auto-tfs.add', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.add([editor.document.uri]);
    });

    const deleteCommand = commands.registerCommand('auto-tfs.delete', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.delete([editor.document.uri]);
    });

    const getCommand = commands.registerCommand('auto-tfs.get', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.get([editor.document.uri]);
    });

    const checkoutExpCommand = commands.registerCommand('auto-tfs.exp-checkout'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        tfs.checkOut([clickedFile, ...selectedFiles]);
    });

    const undoExpCommand = commands.registerCommand('auto-tfs.exp-undo'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        tfs.undo([clickedFile, ...selectedFiles]);
    });

    const addExpCommand = commands.registerCommand('auto-tfs.exp-add'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        tfs.add([clickedFile, ...selectedFiles]);
    });

    const checkoutTileCommand = commands.registerCommand('auto-tfs.tile-checkout'
    , async (clickedFile: Uri) => {
        tfs.checkOut([clickedFile]);
    });

    const undoTileCommand = commands.registerCommand('auto-tfs.tile-undo'
    , async (clickedFile: Uri) => {
        tfs.undo([clickedFile]);
    });

    const addTileCommand = commands.registerCommand('auto-tfs.tile-add'
    , async (clickedFile: Uri) => {
        tfs.add([clickedFile]);
    });

    const checkoutIdeCommand = commands.registerCommand('auto-tfs.ide-checkout'
    , async (clickedFile: Uri) => {
        tfs.checkOut([clickedFile]);
    });

    const undoIdeCommand = commands.registerCommand('auto-tfs.ide-undo'
    , async (clickedFile: Uri) => {
        tfs.undo([clickedFile]);
    });

    const addIdeCommand = commands.registerCommand('auto-tfs.ide-add'
    , async (clickedFile: Uri) => {
        tfs.add([clickedFile]);
    });

    const deleteExpCommand = commands.registerCommand('auto-tfs.exp-delete'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        tfs.delete([clickedFile, ...selectedFiles]);
    });

    const deleteTileCommand = commands.registerCommand('auto-tfs.tile-delete'
    , async (clickedFile: Uri) => {
        tfs.delete([clickedFile]);
    });

    const deleteIdeCommand = commands.registerCommand('auto-tfs.ide-delete'
    , async (clickedFile: Uri) => {
        tfs.delete([clickedFile]);
    });

    const getExpCommand = commands.registerCommand('auto-tfs.exp-get'
    , async (clickedFile: Uri, selectedFiles: Uri[]) => {
        tfs.get([clickedFile, ...selectedFiles]);
    });

    const getTileCommand = commands.registerCommand('auto-tfs.tile-get'
    , async (clickedFile: Uri) => {
        tfs.get([clickedFile]);
    });

    const getIdeCommand = commands.registerCommand('auto-tfs.ide-get'
    , async (clickedFile: Uri) => {
        tfs.get([clickedFile]);
    });

    const vsDiffExpCommand = commands.registerCommand('auto-tfs.exp-vsdiff'
    , async (clickedFile: Uri, _selectedFiles: Uri[]) => {
        tfs.vsDiff(clickedFile);
    });

    const vsDiffTileCommand = commands.registerCommand('auto-tfs.tile-vsdiff'
    , async (clickedFile: Uri) => {
        tfs.vsDiff(clickedFile);
    });

    const vsDiffIdeCommand = commands.registerCommand('auto-tfs.ide-vsdiff'
    , async (clickedFile: Uri) => {
        tfs.vsDiff(clickedFile);
    });

    const codeDiffExpCommand = commands.registerCommand('auto-tfs.exp-codediff'
    , async (clickedFile: Uri, _selectedFiles: Uri[]) => {
        tfs.codeDiff(clickedFile);
    });

    const codeDiffTileCommand = commands.registerCommand('auto-tfs.tile-codediff'
    , async (clickedFile: Uri) => {
        tfs.codeDiff(clickedFile);
    });

    const codeDiffIdeCommand = commands.registerCommand('auto-tfs.ide-codediff'
    , async (clickedFile: Uri) => {
        tfs.codeDiff(clickedFile);
    });

    const vsDiffCommand = commands.registerCommand('auto-tfs.vsdiff', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.vsDiff(editor.document.uri);
    });

    const codeDiffCommand = commands.registerCommand('auto-tfs.codediff', async () => {
        const editor = getActiveEditor();
        if (!editor) {
            return;
        }
        tfs.codeDiff(editor.document.uri);
    });

    const onChange = workspace.onDidChangeTextDocument( async (event: TextDocumentChangeEvent) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Change') {
            return;
        }
        tfs.checkOut([event.document.uri]);
    });

    const onSave = workspace.onDidSaveTextDocument( async (document: TextDocument) => {
        const configuration = new Configuration();
        const autoCheckout = configuration.tfAutoCheckout();
        if (autoCheckout !== 'On Save') {
            return;
        }
        tfs.checkOut([document.uri]);
    });

    const onRename = workspace.onWillRenameFiles((event: FileWillRenameEvent) => {
        return event.waitUntil(tryRenameFiles(event));
    });

    const onCreate = workspace.onDidCreateFiles( async (event: FileCreateEvent) => {
        const configuration = new Configuration();
        const autoAdd = configuration.isTfAutoAdd();
        if (!autoAdd) {
            return;
        }
        tfs.add(event.files);
    });

    const onDelete = workspace.onDidDeleteFiles( async (event: FileDeleteEvent) => {
        const configuration = new Configuration();
        const autoDelete = configuration.isTfAutoDelete();
        if (!autoDelete) {
            return;
        }
        tfs.delete(event.files);
    });

    const tryRenameFiles = (event: FileWillRenameEvent): Thenable<void> => {
        try {
            const configuration = new Configuration();
            const autoRename = configuration.isTfAutoRename();
            if (!autoRename) {
                return Promise.resolve();
            }
            return tfs.rename(event.files);
        } catch {
            return Promise.resolve();
        }
    };

    const getActiveEditor = (): TextEditor | null => {
        if (!window.activeTextEditor) {
            const message = 'No active document.';
            new Message().info(message);
            OutputChannel.log(message);
            return null;
        }
        return window.activeTextEditor;
    };

    context.subscriptions.push(
        checkoutCommand,
        undoCommand,
        addCommand,
        deleteCommand,
        getCommand,
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
        addIdeCommand,
        deleteExpCommand,
        deleteTileCommand,
        deleteIdeCommand,
        getExpCommand,
        getTileCommand,
        getIdeCommand,
        vsDiffExpCommand,
        vsDiffTileCommand,
        vsDiffIdeCommand,
        codeDiffExpCommand,
        codeDiffTileCommand,
        codeDiffIdeCommand,
        vsDiffCommand,
        codeDiffCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
    OutputChannel.log('Auto TFS stopped');
 }