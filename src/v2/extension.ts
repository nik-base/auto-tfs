import { ExtensionContext, commands, workspace, Uri, window, TextEditor, SourceControlResourceState, SourceControl, FileWillRenameEvent } from 'vscode';
import { Configuration } from './configuration';
import { TfsProcessManager } from './process-manager';
import { TfsService } from './tfs-service';
import { StatusCommand } from './commands/status';
import { CheckoutCommand } from './commands/checkout';
import { UndoCommand } from './commands/undo';
import { AddCommand } from './commands/add';
import { DeleteCommand } from './commands/delete';
import { GetCommand } from './commands/get';
import { DiffCommand } from './commands/diff';
import { ViewCommand } from './commands/view';
import { HistoryCommand } from './commands/history';
import { OpenOnServer } from './ui/open-on-server';
import { RenameCommand, RenameItem } from './commands/rename';
import { ShelveCommand } from './commands/shelve';
import { CheckinCommand } from './commands/checkin';
import { V2SCMProvider } from './scm/scm';

export function activateV2(context: ExtensionContext) {
    const config = new Configuration();
    const processManager = new TfsProcessManager();
    const tfsService = new TfsService(processManager, config);
    const openOnServer = new OpenOnServer(tfsService);
    const scmProvider = new V2SCMProvider(tfsService, context);

    const getFiles = (clickedFile: Uri, selectedFiles: Uri[]): readonly Uri[] => {
        const files: Uri[] = [];
        if (selectedFiles?.length) {
            files.push(...selectedFiles);
        }
        if (clickedFile && !files.map(m => m.fsPath).includes(clickedFile.fsPath)) {
            files.push(clickedFile);
        }
        if (files.length) {
            return files;
        }
        const editor = window.activeTextEditor;
        if (!editor) {
            return [];
        }
        return [editor.document.uri];
    };

    const checkoutCommand = commands.registerCommand('auto-tfs.checkout', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new CheckoutCommand(), Array.from(files));
    });

    const undoCommand = commands.registerCommand('auto-tfs.undo', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new UndoCommand(), Array.from(files));
    });

    const addCommand = commands.registerCommand('auto-tfs.add', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new AddCommand(), Array.from(files));
    });

    const deleteCommand = commands.registerCommand('auto-tfs.delete', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new DeleteCommand(), Array.from(files));
    });

    const getCommand = commands.registerCommand('auto-tfs.get', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new GetCommand(), Array.from(files));
    });

    const vsDiffCommand = commands.registerCommand('auto-tfs.vsdiff', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new DiffCommand(), files[0]);
    });

    const codeDiffCommand = commands.registerCommand('auto-tfs.codediff', async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files = getFiles(clickedFile, selectedFiles);
        if (!files?.length) {
            return;
        }
        await tfsService.execute(new ViewCommand(), files[0]);
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
        await openOnServer.open(uri);
    });

    const historyCommand = commands.registerCommand('auto-tfs.history', async (item: Uri | SourceControlResourceState) => {
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
        await tfsService.execute(new HistoryCommand(), uri);
    });

    const syncCommand = commands.registerCommand('auto-tfs.sync', async (): Promise<void> => {
        await scmProvider.sync();
    });

    const getAllCommand = commands.registerCommand('auto-tfs.getall', async () => {
        if (!workspace.workspaceFolders) {
            return;
        }
        const workspaceRoot = workspace.workspaceFolders[0].uri;
        await tfsService.execute(new GetCommand(), [workspaceRoot]);
    });

    const onRename = workspace.onWillRenameFiles(async (event: FileWillRenameEvent) => {
        const promises = event.files.map(file => {
            const item: RenameItem = { oldUri: file.oldUri, newUri: file.newUri };
            return tfsService.execute(new RenameCommand(), item);
        });
        await Promise.all(promises);
    });

    const shelveCommand = commands.registerCommand('auto-tfs.shelve', async (sourceControl: SourceControl) => {
        const shelveName = await window.showInputBox({ prompt: 'Enter a name for the shelveset' });
        if (!shelveName) {
            return;
        }
        // For now, we are shelving all files. We need to implement SCM to get included files.
        const files = workspace.textDocuments.map(doc => doc.uri);
        await tfsService.execute(new ShelveCommand(), { name: shelveName, uris: files });
    });

    const checkinCommand = commands.registerCommand('auto-tfs.checkin', async (sourceControl: SourceControl) => {
        const comment = await window.showInputBox({ prompt: 'Enter a check-in comment' });
        if (!comment) {
            return;
        }
        // For now, we are shelving all files. We need to implement SCM to get included files.
        const files = workspace.textDocuments.map(doc => doc.uri);
        await tfsService.execute(new CheckinCommand(config), { comment: comment, uris: files });
    });

    const onChange = workspace.onDidChangeTextDocument( async (event) => {
        const autoCheckout = config.tfAutoCheckout();
        if (autoCheckout !== 'On Change') {
            return;
        }
        await tfsService.execute(new CheckoutCommand(), [event.document.uri]);
    });

    const onSave = workspace.onDidSaveTextDocument( async (document) => {
        const autoCheckout = config.tfAutoCheckout();
        if (autoCheckout !== 'On Save') {
            return;
        }
        await tfsService.execute(new CheckoutCommand(), [document.uri]);
    });

    const onCreate = workspace.onDidCreateFiles( async (event) => {
        if (!config.isTfAutoAdd()) {
            return;
        }
        await tfsService.execute(new AddCommand(), Array.from(event.files));
    });

    const onDelete = workspace.onDidDeleteFiles( async (event) => {
        if (!config.isTfAutoDelete()) {
            return;
        }
        await tfsService.execute(new DeleteCommand(), Array.from(event.files));
    });

    // SCM commands are not implemented yet.
    
    context.subscriptions.push(
        checkoutCommand,
        undoCommand,
        addCommand,
        deleteCommand,
        getCommand,
        vsDiffCommand,
        codeDiffCommand,
        openOnServerCommand,
        historyCommand,
        syncCommand,
        getAllCommand,
        onRename,
        shelveCommand,
        checkinCommand,
        onChange,
        onSave,
        onCreate,
        onDelete,
        scmProvider.sourceControl
    );
}
