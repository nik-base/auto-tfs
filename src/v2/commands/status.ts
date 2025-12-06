import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { SCMChange, SCMChangeType } from '../scm';
import { Configuration } from '../configuration';

export class StatusCommand implements TfsCommand<Uri, SCMChange[]> {

    public getCommandAndArgs(uri: Uri, config: Configuration): string[] {
        // tf status /format:detailed <path> /recursive
        return ['status', '/format:detailed', uri.fsPath, '/recursive'];
    }

    public handleOutput(output: string, uri?: Uri): SCMChange[] {
        // This is a simplified parser that only supports English.
        // TODO: Add support for other languages by implementing a locale service.
        const lines = output.split(/\r?\n/);
        const changes: SCMChange[] = [];
        let previousChangeType = SCMChangeType.Pristine;
        
        if (!uri) {
            return [];
        }

        for (const line of lines) {
            previousChangeType = this.processLine(line, previousChangeType, uri.fsPath, changes);
        }

        return changes;
    }

    private processLine(line: string, previousChangeType: SCMChangeType, root: string, changes: SCMChange[]): SCMChangeType {
        const changeType = this.tryProcessChangeLine(line);
        if (changeType !== null) {
            return changeType;
        }
        this.tryProcessLocalItemLine(line, root, previousChangeType, changes);
        return previousChangeType;
    }

    private tryProcessChangeLine(line: string): SCMChangeType | null {
        const changeRegex = /^\s*Change\s*:\s*(.*)\s*$/i;
        const changeMatch = line.match(changeRegex);
        if (!changeMatch || changeMatch.length < 2) {
            return null;
        }
        return this.processChangeLineMatch(changeMatch);
    }

    private processChangeLineMatch(changeMatch: RegExpMatchArray): SCMChangeType {
        const change = changeMatch[1].toLowerCase();
        if (change.includes('add')) {
            return SCMChangeType.Added;
        } else if (change.includes('delete')) {
            return SCMChangeType.Deleted;
        } else if (change.includes('rename') && change.includes('edit')) {
            return SCMChangeType.RenamedModified;
        } else if (change.includes('rename')) {
            return SCMChangeType.Renamed;
        } else if (change.includes('edit')) {
            return SCMChangeType.Modified;
        }
        return SCMChangeType.Pristine;
    }

    private tryProcessLocalItemLine(line: string, root: string, previousChangeType: SCMChangeType, changes: SCMChange[]): void {
        const localItemRegex = /^\s*Local item\s*:\s*(.*)\s*$/i;
        const localItemMatch = line.match(localItemRegex);
        if (!localItemMatch || localItemMatch.length < 2) {
            return;
        }
        this.processLocalItemLine(localItemMatch, root, previousChangeType, changes);
    }

    private processLocalItemLine(localItemMatch: RegExpMatchArray, root: string, previousChangeType: SCMChangeType, changes: SCMChange[]): void {
        if (previousChangeType === SCMChangeType.Pristine) {
            return;
        }
        const filePath = localItemMatch[1];
        const index = filePath.toLocaleLowerCase().indexOf(root.toLocaleLowerCase());
        const path = filePath.substring(index);
        this.addChange(path, previousChangeType, changes);
    }

    private addChange(path: string, changeType: SCMChangeType, changes: SCMChange[]): void {
        const change = new SCMChange();
        change.path = path;
        change.type = changeType;
        changes.push(change);
    }
}
