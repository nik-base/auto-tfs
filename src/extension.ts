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

    const checkoutCommand = commands.registerCommand('auto-tfs.checkout', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.checkOut(files);
    });

    const undoCommand = commands.registerCommand('auto-tfs.undo', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.undo(files);
    });

    const addCommand = commands.registerCommand('auto-tfs.add', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.add(files);
    });

    const deleteCommand = commands.registerCommand('auto-tfs.delete', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.delete(files);
    });

    const getCommand = commands.registerCommand('auto-tfs.get', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.get(files);
    });

    const vsDiffCommand = commands.registerCommand('auto-tfs.vsdiff', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.vsDiff(files[0]);
    });

    const codeDiffCommand = commands.registerCommand('auto-tfs.codediff', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        tfs.codeDiff(files[0]);
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

    const getFiles = (clickedFile: Uri, selectedFiles: Uri[]): Uri[] => {
        const files: Uri[] = [];
        if (selectedFiles?.length) {
            files.push(...selectedFiles);
        }
        if (clickedFile) {
            files.push(clickedFile);
        }
        if (files.length) {
            return files;
        }
        const editor = getActiveEditor();
        if (!editor) {
            return [];
        }
        return [editor.document.uri];
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
        vsDiffCommand,
        codeDiffCommand,
        onChange,
        onRename,
        onSave,
        onCreate,
        onDelete);
}

// this method is called when your extension is deactivated
export function deactivate() {
    OutputChannel.log('Auto TFS stopped');
 }