import * as vscode from 'vscode';

export interface ILocalTfvcService {
    checkout(filePaths: string[]): Promise<void>;
    add(filePaths: string[]): Promise<void>;
    delete(filePaths: string[]): Promise<void>;
    undo(filePaths: string[]): Promise<void>;
    status(workspaceRoot: string): Promise<TfvcStatus[]>;
    getRepoVersion(filePath: string): Promise<vscode.Uri>;
}

export interface IServerTfvcService {
    getHistory(serverPath: string): Promise<any[]>;
}

export interface TfvcStatus {
    localPath: string;
    changeType: "edit" | "add" | "delete" | "rename";
}
