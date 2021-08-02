import { CheckoutTfsCommand } from './tfs/impl/checkout-tfs-command';
import { TfsCommand } from './tfs/tfs-command';
import { Process } from './process';
import { Uri } from 'vscode';
import { UndoTfsCommand } from './tfs/impl/undo-tfs-command';
import { AddTfsCommand } from './tfs/impl/add-tfs-command';
import { DeleteTfsCommand } from './tfs/impl/delete-tfs-command';
import { Configuration } from './configuration';
import { Message } from './ui/message';
import { Logger } from './logger';
import { RenameTfsCommand } from './tfs/impl/rename-tfs-command';
import { OutputChannel } from './output-channel';
import { InfoTfsCommand } from './tfs/impl/info-fs-command';
import { InfoProcessHandler } from './handler/impl/info-process-handler';

export class Tfs {
    private configuration = new Configuration();
    private message = new Message();
    private logger = new Logger();

    public checkOut(): void {
        this.executeCommand(new CheckoutTfsCommand());
    }

    public checkOutFile(uri: Uri): void {
        if (!this.checkAction(new CheckoutTfsCommand(), uri, null)) {
            return;
        }
        this.confirmCheckout().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new CheckoutTfsCommand(), uri, null);
            }
        });
    }

    public checkOutFiles(uriList: readonly Uri[]): void {
        this.confirmCheckout().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new CheckoutTfsCommand(), uri, null);
                }
            }
        });
    }

    public renameFiles(files: ReadonlyArray<{ readonly oldUri: Uri, readonly newUri: Uri }>): Thenable<any> {
        return new Promise<any>((_, reject) => this.confirmRename().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const file of files) {
                    this.executeCommandFileSync(new RenameTfsCommand(), file.oldUri, file.newUri);
                }
            }
            return reject();
        }));
    }

    public undo(): void {
        this.executeCommand(new UndoTfsCommand());
    }

    public undoFile(uri: Uri): void {
        this.confirmUndo().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new UndoTfsCommand(), uri, null);
            }
        });
    }

    public undoFiles(uriList: readonly Uri[]): void {
        this.confirmUndo().then((selectedItem: string | undefined) => {
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

    public addFile(uri: Uri): void {
        this.confirmAdd().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new AddTfsCommand(), uri, null);
            }
        });
    }

    public addFiles(uriList: readonly Uri[]): void {
        this.confirmAdd().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new AddTfsCommand(), uri, null);
                }
            }
        });
    }

    public delete(): void {
        this.confirmFileDelete().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommand(new DeleteTfsCommand());
            }
        });
    }

    public deleteFile(uri: Uri): void {
        this.confirmDelete().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommandFile(new DeleteTfsCommand(), uri, null);
            }
        });
    }


    public deleteFiles(uriList: readonly Uri[]): void {
        this.confirmDelete().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const uri of uriList) {
                    this.executeCommandFile(new DeleteTfsCommand(), uri, null);
                }
            }
        });
    }

    private checkAction(command: TfsCommand, uri: Uri, data: any): boolean {
        const tfPath = this.getTfPath();
        if (!tfPath) {
            return false;
        }
        const result = this.checkInfo(tfPath, command, uri, data);
        if (!result.proceed) {
            OutputChannel.log(result.msg);
            return false;
        }
        return true;
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
            if (!process) {
                return;
            }
            this.handleProcess(process, command);
        });
    }

    private executeCommandFile(command: TfsCommand, uri: Uri, data: any) {
        this.logger.tryAndLogWithException(() => {
            const process = this.getProcess(command, uri, data);
            if (!process) {
                return;
            }
            this.handleProcess(process, command);
        });
    }

    private executeCommandFileSync(command: TfsCommand, uri: Uri, data: any) {
        this.logger.tryAndLogWithException(() => {
            this.triggerProcessSync(command, uri, data);
        });
    }

    private getTfPath(): string | null {
        const tfPath = this.configuration.getTfPath();
        if (!tfPath) {
            const message = 'The path to TF command is not configured. Please, check the property auto-tfs.tf.path in VS Code settings';
            this.message.error(message);
            OutputChannel.log(message);
            return null;
        }
        return tfPath;
    }

    private getProcess(command: TfsCommand, uri: Uri | undefined, data: any): Process | null {
        const tfPath = this.getTfPath();
        if (!tfPath) {
            return null;
        }
        if (uri) {
            const result = this.checkInfo(tfPath, command, uri, data);
            if (!result.proceed) {
                OutputChannel.log(result.msg);
                return null;
            }
        }
        const args = uri ? command.getCommandAndArgsFile(uri, data) : command.getCommandAndArgs();
        const process = new Process();
        process.spawn(tfPath!, args);
        return process;
    }

    private triggerProcessSync(command: TfsCommand, uri: Uri | undefined, data: any): string | null {
        const tfPath = this.getTfPath();
        if (!tfPath) {
            return null;
        }
        if (uri) {
            const change = this.checkInfo(tfPath, command, uri, data);
            if (!change.proceed) {
                OutputChannel.log(change.msg);
                return null;
            }
        }
        const process = new Process();
        const message = `The TF command '${command.command}' is in progress...`;
        OutputChannel.log(message);
        const args = uri ? command.getCommandAndArgsFile(uri, data) : command.getCommandAndArgs();
        const result = process.spawnSync(tfPath!, args);
        return result;
    }

    private checkInfo(tfPath: string, tfs: TfsCommand, uri: Uri | undefined, data: any): { proceed: boolean, msg: string } {
        if (tfs.command !== 'checkout') {
            return { proceed: true, msg: '' };
        }
        OutputChannel.log(`Getting info on ${uri?.fsPath} from source control`);
        const infoCommand = new InfoTfsCommand();
        const args = uri ? infoCommand.getCommandAndArgsFile(uri, data) : infoCommand.getCommandAndArgs();
        const process = new Process();
        const message = `The TF command '${infoCommand.command}' is in progress...`;
        OutputChannel.log(message);
        const result = process.spawnSync(tfPath!, args);
        const processHandler = infoCommand.getConsoleDataHandler() as InfoProcessHandler;
        const changeType = processHandler.getData(result);
        return this.handleCheckout(changeType, uri!);
    }

    private handleCheckout(change: string | null, uri: Uri): { proceed: boolean, msg: string } {
        if (change === 'edit') {
            return { proceed: false, msg: `File ${uri.fsPath} already checked out` };
        }
        if (change === 'add') {
            return { proceed: false, msg: `File ${uri.fsPath} is newly added` };
        }
        return { proceed: true, msg: '' };
    }

    private handleProcess(process: Process, command: TfsCommand): void {
        const message = `The TF command '${process.getCommandName()}' is in progress...`;
        this.message.info(message);
        OutputChannel.log(message);
        const processHandler = command.getConsoleDataHandler();
        processHandler.registerHandlers(process);
    }
}