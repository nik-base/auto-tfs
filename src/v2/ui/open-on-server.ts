import { env, Uri } from 'vscode';
import { TfsService } from '../tfs-service';
import { WorkfoldCommand } from '../commands/workfold';

export class OpenOnServer {
    constructor(private tfsService: TfsService) {}

    public async open(uri: Uri): Promise<void> {
        if (!uri) {
            return;
        }

        const workfoldCommand = new WorkfoldCommand();
        const result = await this.tfsService.execute(workfoldCommand, uri);

        if (!result?.baseUrl || !result?.projectName || !result?.path) {
            return;
        }
        
        const url = `${result.baseUrl}/${result.projectName}/_versionControl?path=${result.path}`;
        env.openExternal(Uri.parse(url));
    }
}
