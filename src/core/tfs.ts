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
import { InfoTfsCommand } from './tfs/impl/info-tfs-command';
import { InfoProcessHandler } from './handler/impl/info-process-handler';
import { GetTfsCommand } from './tfs/impl/get-tfs-command';
import { DiffTfsCommand } from './tfs/impl/diff-tfs-command';
import { ViewTfsCommand } from './tfs/impl/view-tfs-command';
import { parse as pathParse } from 'path';

export class Tfs {
    private configuration = new Configuration();
    private message = new Message();
    private logger = new Logger();

    public checkOut(uriList: readonly Uri[]): void {
        const command = new CheckoutTfsCommand();
        this.exec(command, uriList, this.confirmCheckout.bind(this));
    }

    public undo(uriList: readonly Uri[]): void {
        const command = new UndoTfsCommand();
        this.exec(command, uriList, this.confirmUndo.bind(this));
    }

    public add(uriList: readonly Uri[]): void {
        const command = new AddTfsCommand();
        this.exec(command, uriList, this.confirmAdd.bind(this));
    }

    public delete(uriList: readonly Uri[]): void {
        const command = new DeleteTfsCommand();
        this.exec(command, uriList, this.confirmDelete.bind(this));
    }

    public get(uriList: readonly Uri[]): void {
        const command = new GetTfsCommand();
        this.exec(command, uriList, this.confirmGet.bind(this));
    }

    public vsDiff(uri: Uri): void {
        const command = new DiffTfsCommand();
        this.executeCommand(command, [uri], null);
    }

    public codeDiff(uri: Uri): void {
        const command = new ViewTfsCommand();
        const parsedTemp = pathParse(uri.fsPath);
        this.executeCommand(command, [uri], { temp: parsedTemp });
    }

    private exec(command: TfsCommand, uriList: readonly Uri[], confirm: () => Thenable<string | undefined>): void {
        if (!uriList.length) {
            return;
        }
        if (uriList.length === 1 && !this.checkAction(command, uriList[0])) {
            return;
        }
        confirm().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommand(command, uriList, null);
            }
        });
    }

    public rename(files: ReadonlyArray<{ readonly oldUri: Uri, readonly newUri: Uri }>): Promise<void> {
        if (!files.length) {
            return Promise.resolve();
        }
        const command = new RenameTfsCommand();
        if (files.length === 1 && !this.checkAction(command, files[0].oldUri)) {
            return Promise.resolve();
        }
        return new Promise((_, reject) => this.confirmRename().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                for (const file of files) {
                    this.executeCommandSync(command, [file.oldUri, file.newUri], null);
                }
            }
            return reject();
        }));
    }

    private checkAction(command: TfsCommand, uri: Uri): boolean {
        const tfPath = this.getTfPath();
        if (!tfPath) {
            return false;
        }
        const result = this.checkInfo(tfPath, command, uri);
        if (!result.proceed) {
            OutputChannel.log(result.msg);
            return false;
        }
        return true;
    }

    private confirmGet(): Thenable<string | undefined> {
        return this.confirm('Do you want to get latest file(s) from source control?');
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

    private confirmed(selectedItem: string | undefined): boolean {
        return selectedItem === 'Yes';
    }

    private executeCommand(command: TfsCommand, uriList: readonly Uri[], data: any) {
        this.logger.tryAndLogWithException(() => {
            const process = this.getProcess(command, uriList, data);
            if (!process) {
                return;
            }
            this.handleProcess(process, command);
        });
    }

    private executeCommandSync(command: TfsCommand, uriList: readonly Uri[], data: any) {
        this.logger.tryAndLogWithException(() => {
            this.triggerProcessSync(command, uriList, data);
        });
    }

    private getTfPath(): string | null {
        const tfPath = this.configuration.getTfPath();
        if (tfPath) {
            return tfPath;
        }
        const message = 'The path to TF command is not configured. Please, check the property auto-tfs.tf.path in VS Code settings';
        this.message.error(message);
        OutputChannel.log(message);
        return null;
    }

    private getProcess(command: TfsCommand, uriList: readonly Uri[], data: any): Process | null {
        const tfPath = this.getTfPath();
        if (!tfPath) {
            return null;
        }
        if (!uriList.length) {
            return null;
        }
        const args = command.getCommandAndArgs(uriList, data);
        const process = new Process(command);
        if (command.command === 'diff') {
            process.spawnShell(tfPath!, args);
        } else {
            process.spawn(tfPath!, args);
        }
        return process;
    }

    private triggerProcessSync(command: TfsCommand, uriList: readonly Uri[], data: any): string | null {
        const tfPath = this.getTfPath();
        if (!tfPath) {
            return null;
        }
        if (!uriList.length) {
            return null;
        }
        const process = new Process(command);
        const args = command.getCommandAndArgs(uriList, data);
        const result = process.spawnSync(tfPath!, args);
        return result;
    }

    private checkInfo(tfPath: string, tfs: TfsCommand, uri: Uri): { proceed: boolean, msg: string } {
        if (tfs.command !== 'checkout') {
            return { proceed: true, msg: '' };
        }
        OutputChannel.log(`Getting info on ${uri?.fsPath} from source control`);
        const infoCommand = new InfoTfsCommand();
        const args = infoCommand.getCommandAndArgs([uri], null);
        const process = new Process(infoCommand);
        const result = process.spawnSync(tfPath!, args);
        const processHandler = infoCommand.getConsoleDataHandler() as InfoProcessHandler;
        const changeType = processHandler.getData(result);
        return this.handleCheckout(changeType, uri!);
    }

    private handleCheckout(change: string | null, uri: Uri): { proceed: boolean, msg: string } {
        if (change!.includes('edit')) {
            return { proceed: false, msg: `File ${uri.fsPath} already checked out` };
        }
        if (change!.includes('add')) {
            return { proceed: false, msg: `File ${uri.fsPath} is newly added` };
        }
        return { proceed: true, msg: '' };
    }

    private handleProcess(process: Process, command: TfsCommand): void {
        const message = `TF command '${process.getCommandName()}' is in progress...`;
        this.message.info(message);
        OutputChannel.log(message);
        const processHandler = command.getConsoleDataHandler();
        processHandler.registerHandlers(process);
    }
}