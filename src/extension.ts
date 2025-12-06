import * as vscode from 'vscode';
import { Configuration } from './common/Configuration';
import { ShellRunner } from './common/ShellRunner';
import { LocalTfvcService } from './tfvc/LocalTfvcService';
import { AutoTfsController } from './controller/AutoTfsController';
import { Logger } from './common/Logger';
import { ScmProvider } from './ScmProvider';

function getFilePaths(clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]): string[] {
    const files: vscode.Uri[] = [];
    if (selectedFiles?.length) {
        files.push(...selectedFiles);
    }
    if (clickedFile && !files.map(m => m.fsPath).includes(clickedFile.fsPath)) {
        files.push(clickedFile);
    }
    if (files.length) {
        return files.map(f => f.fsPath);
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return [];
    }
    return [editor.document.uri.fsPath];
}

export function activate(context: vscode.ExtensionContext) {
    Logger.log("Activating Auto TFS (Async)...");

    // 1. Init Dependencies
    const runner = new ShellRunner(Configuration.tfPath);
    const localTfvc = new LocalTfvcService(runner);
    const controller = new AutoTfsController(localTfvc);
    const scmProvider = new ScmProvider(localTfvc);

    // 2. Register Event Listeners
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(e => controller.onWillSaveTextDocument(e)),
        vscode.workspace.onDidCreateFiles(e => {
            e.files.forEach(f => controller.onFileCreated(f));
            scmProvider.refresh();
        }),
        vscode.workspace.onDidDeleteFiles(e => {
            e.files.forEach(f => controller.onFileDeleted(f));
            scmProvider.refresh();
        }),
        vscode.workspace.onDidRenameFiles(e => {
            controller.onFileRenamed(e);
            scmProvider.refresh();
        })
    );

    // 3. Register Commands
    const checkoutCommand = vscode.commands.registerCommand('auto-tfs.checkout', async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const filePaths = getFilePaths(clickedFile, selectedFiles);
        await localTfvc.checkout(filePaths);
        await scmProvider.refresh();
    });

    const undoCommand = vscode.commands.registerCommand('auto-tfs.undo', async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const filePaths = getFilePaths(clickedFile, selectedFiles);
        await localTfvc.undo(filePaths);
        await scmProvider.refresh();
    });

    const addCommand = vscode.commands.registerCommand('auto-tfs.add', async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const filePaths = getFilePaths(clickedFile, selectedFiles);
        await localTfvc.add(filePaths);
        await scmProvider.refresh();
    });

    const deleteCommand = vscode.commands.registerCommand('auto-tfs.delete', async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        const filePaths = getFilePaths(clickedFile, selectedFiles);
        await localTfvc.delete(filePaths);
        await scmProvider.refresh();
    });

    const refreshCommand = vscode.commands.registerCommand('auto-tfs.scm.refresh', () => {
        scmProvider.refresh();
    });

    const showDiffCommand = vscode.commands.registerCommand('auto-tfs.showDiff', async (resourceUri: vscode.Uri) => {
        const repoVersionUri = await localTfvc.getRepoVersion(resourceUri.fsPath);
        const fileName = vscode.workspace.asRelativePath(resourceUri);
        await vscode.commands.executeCommand('vscode.diff', repoVersionUri, resourceUri, `${fileName} (Server) ↔ ${fileName} (Workspace)`);
    });


    context.subscriptions.push(
        checkoutCommand,
        undoCommand,
        addCommand,
        deleteCommand,
        refreshCommand,
        showDiffCommand
    );

    // Initial refresh
    scmProvider.refresh();

    Logger.log("Auto TFS Activated.");
}

export function deactivate() {
    Logger.log("Deactivating Auto TFS...");
}
