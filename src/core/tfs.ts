import { CheckoutTfsCommand } from './tfs/impl/checkout-tfs-command';
import { TfsCommand } from './tfs/tfs-command';
import { Process } from './process';
import { SourceControl, SourceControlResourceGroup, SourceControlResourceState, Uri, workspace } from 'vscode';
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
import { SCM, SCMChange, SCMChangeType } from './scm';
import { StatusBar } from './ui/status-bar';
import { StatusTfsCommand } from './tfs/impl/status-tfs-command';
import { StatusProcessHandler } from './handler/impl/status-process-handler';
import { ViewProcessHandler } from './handler/impl/view-process-handler';
import { OpenOnServer } from './ui/open-on-server';
import { ShelveTfsCommand } from './tfs/impl/shelve-tfs-command';
import { CheckinTfsCommand } from './tfs/impl/checkin-tfs-command';
import { HistoryTfsCommand } from './tfs/impl/history-tfs-command';

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

    public shelve(sourceControl: SourceControl): void {
        const uriList = this.getIncludedChanges();
        const shelveName = sourceControl?.inputBox?.value;
        if (!shelveName) {
            this.message.error('Please provide a name for this shelve');
            return;
        }
        const command = new ShelveTfsCommand();
        this.execWithoutConfirm(command, uriList, { name: shelveName, sourceControl: sourceControl });
    }

    public replaceShelve(sourceControl: SourceControl): void {
        const uriList = this.getIncludedChanges();
        const shelveName = sourceControl.inputBox.value;
        const command = new ShelveTfsCommand();
        this.execWithoutConfirm(command, uriList, { name: shelveName, replace: true });
    }

    public checkin(sourceControl: SourceControl): void {
        if (!this.configuration.tfCheckin() || this.configuration.tfCheckin() === 'Disabled') {
            return;
        }
        const uriList = this.getIncludedChanges();
        const comment = sourceControl?.inputBox?.value;
        if (!comment) {
            this.message.error('Please provide a comment for this checkin');
            return;
        }
        const command = new CheckinTfsCommand();
        this.execWithData(command, uriList, { comment: comment, sourceControl: sourceControl }, this.confirmCheckin.bind(this));
    }

    public async getAll(): Promise<void> {
        const root = this.getRootUri();
        if (!root) {
            return;
        }
        StatusBar.startGetAll();
        SCM.startGetAll();
        const command = new GetTfsCommand();
        await this.executeCommandSyncWithConfirm(command, [root], null, this.confirmGet.bind(this)).then(() => {
            StatusBar.stopGetAll();
            SCM.stopGetAll();
        });
    }

    public undoAll(): void {
        const included = SCM.getIncludedChanges();
        const excluded = SCM.getExcludedChanges();
        const allChanges = [...included, ...excluded];
        if (!allChanges?.length) {
            return;
        }
        const uriList = allChanges.map(m => m.resourceUri);
        this.undo(uriList);
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

    public openOnServer(uri: Uri): void {
        new OpenOnServer().open(uri);
    }

    public history(uri: Uri): void {
        const command = new HistoryTfsCommand();
        this.executeCommand(command, [uri], null);
    }

    public async scmOpen(uri: Uri, change: SCMChange): Promise<void> {
        if (change.type === SCMChangeType.Deleted) {
            this.openDeletedFile(uri);
            return;
        }
        if (change.type === SCMChangeType.Added)  {
            await new ViewProcessHandler().openFile(uri);
            return;
        }
        if (change.type === SCMChangeType.Renamed || SCMChangeType.RenamedModified) {
            const sourceItem = this.getSourceItem(uri);
            const command = new ViewTfsCommand();
            const parsedTemp = pathParse(uri.fsPath);
            this.executeCommand(command, [uri], { temp: parsedTemp, sourceItem: sourceItem });
            return;
        }
        this.codeDiff(uri);
    }

    public async scmView(uri: Uri, change: SCMChange): Promise<void> {
        if (change.type === SCMChangeType.Deleted) {
            this.openDeletedFile(uri);
            return;
        }
        await new ViewProcessHandler().openFile(uri);
    }

    public async sync(): Promise<void> {
        const command = new StatusTfsCommand();
        if (!workspace.workspaceFolders) {
            return;
        }
        StatusBar.startSync();
        SCM.startSync();
        const uri = workspace.workspaceFolders[0].uri;
        const result = this.executeCommandSync(command, [uri], null);
        await new StatusProcessHandler().processData(result!.toString());
        StatusBar.stopSync();
        SCM.stopSync();
    }

    public undoGroup(resourceGroup: SourceControlResourceGroup): void {
        const uriList = resourceGroup.resourceStates.map(m => m.resourceUri);
        this.undo(uriList);
    }

    public exclude(...resources: SourceControlResourceState[]): void {
        SCM.exclude(...resources);
    }

    public excludeAll(): void {
        SCM.excludeAll();
    }

    public include(...resources: SourceControlResourceState[]): void {
        SCM.include(...resources);
    }

    public includeAll(): void {
        SCM.includeAll();
    }

    public autoSync(): void {
        if (!this.configuration.getTfPath() || !this.configuration.isTfAutoSync()) {
            return;
        }
        this.sync();
    }

    public rename(files: ReadonlyArray<{ readonly oldUri: Uri; readonly newUri: Uri }>): Promise<void> {
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
                this.autoSync();
            }
            return reject();
        }));
    }

    public confirmShelveReplace(shelve: string): Thenable<string | undefined> {
        return this.message.warning(`Shelve '${shelve}' already exists. Do you want to replace it?`, 'Yes', 'No');
    }

    private getIncludedChanges(): Uri[] {
        const changes = SCM.getIncludedChanges();
        const uriList = changes.map(m => m.resourceUri);
        return uriList;
    }

    private getRootUri(): Uri | null {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders?.length) {
            return null;
        }
        const root = workspaceFolders[0].uri;
        return root;
    }

    private openDeletedFile(uri: Uri): void {
        const sourceItem = this.getSourceItem(uri);
        const command = new ViewTfsCommand();
        const parsedTemp = pathParse(uri.fsPath);
        this.executeCommand(command, [uri], { temp: parsedTemp, sourceItem: sourceItem, nodiff: true });
    }

    private getSourceItem(uri: Uri): string | null {
        const command = new InfoTfsCommand();
        const result = this.executeCommandSync(command, [uri], { item: 'sourceitem' });
        const sourceItem = new InfoProcessHandler().getSourceItem(result!.toString());
        return sourceItem;
    }

    private execWithoutConfirm(command: TfsCommand, uriList: readonly Uri[], data: any): void {
        if (!uriList.length) {
            return;
        }
        if (uriList.length === 1 && !this.checkAction(command, uriList[0])) {
            return;
        }
        this.executeCommand(command, uriList, data);
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

    private execWithData(command: TfsCommand, uriList: readonly Uri[], data: any, confirm: () => Thenable<string | undefined>): void {
        if (!uriList.length) {
            return;
        }
        if (uriList.length === 1 && !this.checkAction(command, uriList[0])) {
            return;
        }
        confirm().then((selectedItem: string | undefined) => {
            if (this.confirmed(selectedItem)) {
                this.executeCommand(command, uriList, data);
            }
        });
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

    private confirmCheckin(): Thenable<string | undefined> {
        return this.confirm('Do you want to checkin file(s) on source control?');
    }

    private confirmUndo(): Thenable<string | undefined> {
        return this.message.warning('Do you want to undo changes to the file(s)?', 'Yes', 'No');
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

    private executeCommandSync(command: TfsCommand, uriList: readonly Uri[], data: any): string | null {
        try {
            return this.triggerProcessSync(command, uriList, data);
        } catch (e) {
            if (this.configuration.isDebugEnabled()) {
                console.log(e);
                OutputChannel.logJson(e);
            }
            throw Error;
        }
    }

    private async executeCommandSyncWithConfirm(command: TfsCommand, uriList: readonly Uri[]
        , data: any, confirm: () => Thenable<string | undefined>): Promise<string | null> {
        if (!uriList.length) {
            return Promise.reject(null);
        }
        if (uriList.length === 1 && !this.checkAction(command, uriList[0])) {
            return Promise.reject(null);
        }
        const selectedItem = await confirm();
        if (this.confirmed(selectedItem)) {
            return this.executeCommandSync(command, uriList, data);
        }
        return null;
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
        if (this.isShellRequired(command)) {
            process.spawnShell(tfPath!, args);
        } else {
            process.spawn(tfPath!, args);
        }
        return process;
    }

    private isShellRequired(command: TfsCommand): boolean {
        if (command.command === 'diff') {
            return true;
        }
        if (command.command === 'checkin' && this.configuration.tfCheckin() === 'With Prompt') {
            return true;
        }
        if (command.command === 'history') {
            return true;
        }
        return false;
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

    private checkInfo(tfPath: string, tfs: TfsCommand, uri: Uri): { proceed: boolean; msg: string } {
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

    private handleCheckout(change: string | null, uri: Uri): { proceed: boolean; msg: string } {
        if (!change) {
            return { proceed: true, msg: '' };
        }
        if (change!.includes('edit')) {
            return { proceed: false, msg: `File ${uri.fsPath} already checked out` };
        }
        if (change!.includes('add')) {
            return { proceed: false, msg: `File ${uri.fsPath} is newly added` };
        }
        return { proceed: true, msg: '' };
    }

    private handleProcess(process: Process, command: TfsCommand): void {
        const processHandler = command.getConsoleDataHandler();
        processHandler.showProgressMessage(process);
        processHandler.registerHandlers(process);
    }
}