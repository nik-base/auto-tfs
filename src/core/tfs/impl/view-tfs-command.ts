import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';
import { ProcessHandler } from '../../handler/process-handler';
import { ViewProcessHandler } from '../../handler/impl/view-process-handler';
import * as os from 'os';

export class ViewTfsCommand extends TfsCommandBase {

    public override readonly command = 'view';

    private tempUri!: Uri;
    private uri!: Uri;

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (uriList.length < 1 || !_data) {
            return [];
        }
        const uri = uriList[0] as Uri;
        this.uri = uri;
        if (!_data.tempPath) {
            return [this.command, uri.fsPath];
        }
        const tempFolder = os.tmpdir();
        const tempPath = `${tempFolder}\\${_data.tempPath}`;
        this.tempUri = Uri.file(tempPath);
        return [this.command, uri.fsPath, `/output:${tempPath}`];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        const handler = new ViewProcessHandler();
        handler.tempUri = this.tempUri;
        handler.uri = this.uri;
        return handler;
    }
}