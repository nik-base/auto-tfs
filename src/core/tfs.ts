import { CheckoutTfsCommand } from './tfs/impl/checkout_tfs_command';
import { TfsCommand } from './tfs/tfs_command';
import { Process } from './process';
import * as vscode from 'vscode';
import { UndoTfsCommand } from './tfs/impl/undo_tfs_command';
import { AddTfsCommand } from './tfs/impl/add_tfs_command';
import { DeleteTfsCommand } from './tfs/impl/delete_tfs_command';
import { Configuration } from './configuration';
import { Message } from './ui/message';
import { Logger } from './logger';
import { RenameTfsCommand } from './tfs/impl/rename_tfs_command';

export class Tfs {
    private configuration = new Configuration();
    private message = new Message();
    private logger = new Logger();

    public checkOut(): void {
        this.executeCommand(new CheckoutTfsCommand());
    }

    public checkOutFile(uri: vscode.Uri): void {
        this.confirmCheckout().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new CheckoutTfsCommand(), uri, null);
            }
        });
    }

    public checkOutFiles(uriList: readonly vscode.Uri[]): void {
        this.confirmCheckout().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new CheckoutTfsCommand(), uri, null);
                }
            }
        });
    }

    public renameFiles(files: ReadonlyArray<{ readonly oldUri: vscode.Uri, readonly newUri: vscode.Uri }>): void {
        this.confirmRename().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const file of files) {
                    this.executeCommandFile(new RenameTfsCommand(), file.oldUri, file.newUri);
                }
            }
        });
    }

    public undo(): void {
        this.executeCommand(new UndoTfsCommand());
    }

    public undoFile(uri: vscode.Uri): void {
        this.confirmUndo().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new UndoTfsCommand(), uri, null);
            }
        });
    }

    public undoFiles(uriList: readonly vscode.Uri[]): void {
        this.confirmUndo().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new UndoTfsCommand(), uri, null);
                }
            }
        });
    }

    public add(): void {
        this.executeCommand(new AddTfsCommand());
    }

    public addFile(uri: vscode.Uri): void {
        this.confirmAdd().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new AddTfsCommand(), uri, null);
            }
        });
    }

    public addFiles(uriList: readonly vscode.Uri[]): void {
        this.confirmAdd().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new AddTfsCommand(), uri, null);
                }
            }
        });
    }

    public delete(): void {
        this.confirmFileDelete().then((selectedItem : string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommand(new DeleteTfsCommand());
            }
        });
    }

    public deleteFile(uri: vscode.Uri): void {
        this.confirmDelete().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new DeleteTfsCommand(), uri, null);
            }
        });
    }


    public deleteFiles(uriList: readonly vscode.Uri[]): void {
        this.confirmDelete().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new DeleteTfsCommand(), uri, null);
                }
            }
        });
    }

    private confirmFileDelete(): Thenable<string | undefined> {
        return this.confirmFile('Do you really want to delete current file(s)?');
    }

    private confirmAdd(): Thenable<string | undefined> {
        return this.confirm('Do you want to add file(s) to source control?');
    }

    private confirmDelete(): Thenable<string | undefined> {
        return this.confirm('Do you want to delete file(s) from source control?');
    }

    private confirmRename(): Thenable<string | undefined> {
        return this.confirm('Do you want to rename file(s) on source control?');
    }

    private confirmCheckout(): Thenable<string | undefined> {
        return this.confirm('Do you want to checkout file(s) on source control?');
    }

    private confirmUndo(): Thenable<string | undefined> {
        return this.confirm('Do you want to undo changes to the file(s)?');
    }

    private confirm(message: string): Thenable<string | undefined> {
        if (!this.configuration.isTfConfirm()) {
            return Promise.resolve('Yes');
        }
        return this.message.warning(message, 'Yes', 'No');
    }

    private confirmFile(message: string): Thenable<string | undefined> {
        return this.message.warning(message, 'Yes', 'No');
    }

    private confirmed(selectedItem: string | undefined): boolean {
        return selectedItem === 'Yes';
    }

    private executeCommand(command: TfsCommand) {
        this.logger.tryAndLogWithException(() => {
            const process = this.getProcess(command, undefined, null);
            this.handleProcess(process, command);
        });
    }

    private executeCommandFile(command: TfsCommand, uri: vscode.Uri, data: any) {
        this.logger.tryAndLogWithException(() => {
            const process = this.getProcess(command, uri, data);
            this.handleProcess(process, command);
        });
    }

    private getProcess(command: TfsCommand, uri: vscode.Uri | undefined, data: any): Process {
        const process = new Process();
        const tfPath = this.configuration.getTfPath();
        if (!tfPath) {
            this.message.error('The path to TF command is not configured. Please, check the property auto-tfs.tf.path in VS Code settings');
        }
        const args = uri ? command.getCommandAndArgsFile(uri, data) : command.getCommandAndArgs();
        process.spawn(tfPath!, args);
        return process;
    }

    private handleProcess(process: Process, command: TfsCommand): void {
        this.message.info(`The TF command '${process.getCommandName()}' is in progress...`);
        const processHandler = command.getConsoleDataHandler();
        processHandler.registerHandlers(process);
    }
}