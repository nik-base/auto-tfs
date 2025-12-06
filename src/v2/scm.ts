import { Uri } from 'vscode';

export enum SCMChangeType {
    Pristine,
    Added,
    Deleted,
    Renamed,
    Modified,
    RenamedModified,
}

export class SCMChange {
    public path!: string;
    public originalPath?: string;
    public type!: SCMChangeType;

    public get resourceUri(): Uri {
        return Uri.file(this.path);
    }
}
