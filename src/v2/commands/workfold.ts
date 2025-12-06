import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export interface WorkfoldResult {
    baseUrl: string | null;
    projectName: string | null;
    path: string | null;
}

export class WorkfoldCommand implements TfsCommand<Uri, WorkfoldResult> {
    public getCommandAndArgs(uri: Uri, config: Configuration): string[] {
        return ['workfold', uri.fsPath];
    }

    public handleOutput(output: string): WorkfoldResult {
        // English only for now
//         const regex = /[

// ]*\s*Collection\s*:\s*(.*)[

// ]*\s*(\/\$(.*?)\/.*?):/i;
        const regex = '';
        const match = output.match(regex);
        if (match?.length >= 4) {
            return {baseUrl: match[1], projectName: match[3], path: match[2] };
        }
        return {baseUrl: null, projectName: null, path: null };
    }
}
