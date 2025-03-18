import { workspace } from 'vscode';
import { OutputChannel } from '../../output-channel';
import { SCM, SCMChange, SCMChangeType } from '../../scm';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';
import { TfsLocaleConfiguration } from '../../tfs-locale-configuration';

export class StatusProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public showMessageOnUI = false;

    private readonly tfsLocaleConfiguration = new TfsLocaleConfiguration();

    public override handleStdOutData(data: string): void {
        this.processData(data);
        super.handleStdOutData(data);
    }

    public async processData(data: string): Promise<void> {
        try {
            const changes = this.getChanges(data);
            await SCM.sync(changes);
        } catch (e: any) {
            if (typeof e === 'string') {
                OutputChannel.log(e);
            } else if (e instanceof Error) {
                OutputChannel.log(e.message);
            }
        }
    }

    public getChanges(data: string): SCMChange[] {
        const lines = data.split('\r\n');
        const changes: SCMChange[] = [];
        const root = workspace.workspaceFolders![0].uri.fsPath;
        let previousChangeType = SCMChangeType.Pristine;
        for (const line of lines) {
            previousChangeType = this.processLine(line, previousChangeType, root, changes);
        }
        return changes;
    }

    private processLine(line: string, previousChangeType: SCMChangeType, root: string, changes: SCMChange[]) {
        const changeType = this.tryProcessChangeLine(line);
        if (changeType != null) {
            return changeType;
        }
        this.tryProcessLocalItemLine(line, root, previousChangeType, changes);
        return previousChangeType;
    }

    private tryProcessLocalItemLine(line: string, root: string, previousChangeType: SCMChangeType, changes: SCMChange[]): void {
        const localItemRegex = new RegExp(` *${this.tfsLocaleConfiguration.localItemRegex} *: *(.*) *`, 'i');
        const localItemMatch = line.match(localItemRegex)!;
        if (!localItemMatch || localItemMatch.length < 2) {
            return;
        }
        this.processLocalItemLine(localItemMatch, root, previousChangeType, changes);
    }

    private processLocalItemLine(localItemMatch: RegExpMatchArray, root: string
        , previousChangeType: SCMChangeType, changes: SCMChange[]): void {
        if (previousChangeType === SCMChangeType.Pristine) {
            return;
        }
        const f = localItemMatch[1];
        const index = f.toLocaleLowerCase().indexOf(root.toLocaleLowerCase());
        const path = f.substring(index);
        this.addChange(path, previousChangeType, changes);
    }

    private addChange(path: string, previousChangeType: SCMChangeType, changes: SCMChange[]): void {
        const change = new SCMChange();
        change.path = path;
        change.type = previousChangeType;
        changes.push(change);
    }

    private tryProcessChangeLine(line: string): SCMChangeType | null {
        const changeRegex = new RegExp(` *${this.tfsLocaleConfiguration.changeRegex} *: *(.*) *`, 'i');
        const changeMatch = line.match(changeRegex)!;
        if (!changeMatch || changeMatch.length < 2) {
            return null;
        }
        return this.processChangeLine(changeMatch);
    }

    private processChangeLine(changeMatch: RegExpMatchArray): SCMChangeType {
        const change = changeMatch[1].toLocaleLowerCase();
        if (change.includes(this.tfsLocaleConfiguration.addRegex)) {
            return SCMChangeType.Added;
        } else if (change.includes(this.tfsLocaleConfiguration.deleteRegex)) {
            return SCMChangeType.Deleted;
        } else if (change.includes(this.tfsLocaleConfiguration.renameRegex) && change.includes(this.tfsLocaleConfiguration.editRegex)) {
            return SCMChangeType.RenamedModified;
        } else if (change.includes(this.tfsLocaleConfiguration.renameRegex)) {
            return SCMChangeType.Renamed;
        } else if (change.includes(this.tfsLocaleConfiguration.editRegex)) {
            return SCMChangeType.Modified;
        }
        return SCMChangeType.Pristine;
    }
}