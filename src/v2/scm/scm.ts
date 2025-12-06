import { scm, ExtensionContext, SourceControl, Uri, workspace } from 'vscode';
import { TfsService } from '../tfs-service';
import { StatusCommand } from '../commands/status';
import { SCMChange } from '../scm';

export class V2SCMProvider {
    public sourceControl: SourceControl;
    private changes: SCMChange[] = [];

    constructor(private tfsService: TfsService, private context: ExtensionContext) {
        this.sourceControl = scm.createSourceControl('auto-tfs', 'Auto TFS');
        // We will add resource groups later.
    }

    public async sync(): Promise<void> {
        if (!workspace.workspaceFolders) {
            return;
        }
        const workspaceRoot = workspace.workspaceFolders[0].uri;
        this.changes = this.tfsService.execute(new StatusCommand(), workspaceRoot);
        console.log('Changes:', this.changes);

        // Here we would update the source control with the changes.
        // For now, we just log them.
    }
}
