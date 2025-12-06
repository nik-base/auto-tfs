import * as vscode from 'vscode';
import { ILocalTfvcService } from '../tfvc/ITfvcService';
import { Logger } from '../common/Logger';
import { Configuration } from '../common/Configuration';

export class AutoTfsController {
    constructor(private tfvc: ILocalTfvcService) {}

    public async onWillSaveTextDocument(e: vscode.TextDocumentWillSaveEvent): Promise<void> {
        const doc = e.document;

        if (doc.uri.scheme !== 'file' || !doc.isDirty) {
            return;
        }

        const autoCheckout = Configuration.autoCheckout;
        if (autoCheckout !== 'On Save') {
            return;
        }

        const checkoutPromise = this.tfvc.checkout([doc.uri.fsPath])
            .then(() => Logger.log(`Checked out: ${doc.uri.fsPath}`))
            .catch(err => {
                Logger.error(`Failed to checkout ${doc.uri.fsPath}`, err);
                vscode.window.showErrorMessage(`TFVC Checkout Failed: ${err.message}`);
            });

        e.waitUntil(checkoutPromise);
    }

    public async onFileCreated(uri: vscode.Uri): Promise<void> {
        if (uri.scheme !== 'file' || !Configuration.isAutoAddEnabled) {
            return;
        }
        try {
            await this.tfvc.add([uri.fsPath]);
            Logger.log(`Added: ${uri.fsPath}`);
        } catch (err) {
            Logger.error(`Add failed`, err);
        }
    }

    public async onFileDeleted(uri: vscode.Uri): Promise<void> {
        if (uri.scheme !== 'file' || !Configuration.isAutoDeleteEnabled) {
            return;
        }
        try {
            await this.tfvc.delete([uri.fsPath]);
            Logger.log(`Deleted: ${uri.fsPath}`);
        } catch (err) {
            Logger.error(`Delete failed`, err);
        }
    }

    public async onFileRenamed(e: vscode.FileRenameEvent): Promise<void> {
        if (!Configuration.isAutoRenameEnabled) {
            return;
        }
        for (const { oldUri, newUri } of e.files) {
            if (oldUri.scheme === 'file') {
                try {
                    await this.tfvc.delete([oldUri.fsPath]);
                    await this.tfvc.add([newUri.fsPath]);
                    Logger.log(`Renamed (Delete+Add): ${oldUri.fsPath} -> ${newUri.fsPath}`);
                } catch (err) {
                    Logger.error(`Rename failed`, err);
                }
            }
        }
    }
}
