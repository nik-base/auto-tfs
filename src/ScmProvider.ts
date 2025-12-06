import * as vscode from 'vscode';
import { ILocalTfvcService } from './tfvc/ITfvcService';

export class ScmProvider {
    private readonly scm: vscode.SourceControl;
    private readonly changedResources: vscode.SourceControlResourceGroup;

    constructor(private tfvcService: ILocalTfvcService) {
        this.scm = vscode.scm.createSourceControl('tfs', 'Auto TFS');
        this.changedResources = this.scm.createResourceGroup('changes', 'Changes');
    }

    public async refresh(): Promise<void> {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            this.changedResources.resourceStates = [];
            return;
        }

        const statuses = await this.tfvcService.status(vscode.workspace.workspaceFolders[0].uri.fsPath);

        const changedUris = statuses.map(status => {
            const uri = vscode.Uri.file(status.localPath);
            const resourceState: vscode.SourceControlResourceState = {
                resourceUri: uri,
                command: {
                    title: "Show Diff",
                    command: "auto-tfs.showDiff",
                    arguments: [uri],
                },
                decorations: {
                    strikeThrough: status.changeType === 'delete',
                    tooltip: status.changeType,
                }
            };
            return resourceState;
        });

        this.changedResources.resourceStates = changedUris;
    }

    public dispose(): void {
        this.scm.dispose();
    }
}
