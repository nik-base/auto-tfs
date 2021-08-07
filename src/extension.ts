import { Message } from './core/ui/message';
import { ExtensionContext, commands, workspace, Uri, window, TextEditor
    , TextDocumentChangeEvent, TextDocument, FileWillRenameEvent, FileCreateEvent, FileDeleteEvent, SourceControlResourceState } from 'vscode';
import { Configuration } from './core/configuration';
import { OutputChannel } from './core/output-channel';
import { Tfs } from './core/tfs';
import { SCM, SCMChange } from './core/scm';
import { StatusBar } from './core/ui/status-bar';

const tfs = new Tfs();
const outputChannel = OutputChannel.init();

export function activate(context: ExtensionContext) {

    OutputChannel.log('Auto TFS started');
    const syncStatus = StatusBar.initSync();
    const getAllStatus = StatusBar.initGetAll();
    const sc = SCM.init();

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

    const openOnServerCommand = commands.registerCommand('auto-tfs.openonserver', async (item: Uri | SourceControlResourceState) => {
        if (!item) {
            return;
        }
        let uri: Uri | undefined;
        if (item instanceof Uri) {
            uri = item;
        } else {
            uri = item.resourceUri;
        }
        if (!uri)  {
            return;
        }
        tfs.openOnServer(uri);
    });

    const syncCommand = commands.registerCommand('auto-tfs.sync', async (): Promise<void> => {
        await tfs.sync();
    });

    const getAllCommand = commands.registerCommand('auto-tfs.getall', async () => {
        tfs.getAll();
    });

    const scmOpenCommand = commands.registerCommand('auto-tfs.scmopen', async (clickedFile: Uri, change: SCMChange) => {
        if (!clickedFile) {
            return;
        }
        await tfs.scmOpen(clickedFile, change);
    });

    const scmViewCommand = commands.registerCommand('auto-tfs.scmview', async (resourceState: SourceControlResourceState) => {
        const uri = resourceState?.resourceUri;
        const args = resourceState?.command?.arguments;
        if (!uri || !args || args.length < 2) {
            return;
        }
        const change = args[1] as SCMChange;
        if (!change) {
            return;
        }
        await tfs.scmView(uri, change);
    });

    const revertCommand = commands.registerCommand('auto-tfs.revert', async (resourceState: SourceControlResourceState) => {
        if (!resourceState?.resourceUri) {
            return;
        }
        tfs.undo([resourceState.resourceUri]);
    });

    const revertSelectedCommand = commands.registerCommand('auto-tfs.revertselected', async (...resourceStates: SourceControlResourceState[]) => {
        if (!resourceStates.length) {
            return;
        }
        const uriList = resourceStates.map(m => m.resourceUri);
        tfs.undo(uriList);
    });

    const revertAllCommand = commands.registerCommand('auto-tfs.revertall', async () => {
        tfs.undoAll();
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

    tfs.autoSync();

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
        onDelete,
        syncStatus,
        syncCommand,
        getAllCommand,
        getAllStatus,
        outputChannel,
        sc.sourceControl,
        sc.sourceControlGroup,
        scmOpenCommand,
        scmViewCommand,
        revertCommand,
        revertSelectedCommand,
        revertAllCommand,
        openOnServerCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
    OutputChannel.log('Auto TFS stopped');
 }