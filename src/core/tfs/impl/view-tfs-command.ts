import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';
import { ProcessHandler } from '../../handler/process-handler';
import { ViewProcessHandler } from '../../handler/impl/view-process-handler';
import { tmpdir } from 'os';
import { ParsedPath } from 'path';

export class ViewTfsCommand extends TfsCommandBase {

    public override readonly command = 'view';

    private parsedTemp!: ParsedPath;
    private tempPath!: string;
    private uri!: Uri;

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (uriList.length < 1 || !_data) {
            return [];
        }
        const uri = uriList[0] as Uri;
        this.uri = uri;
        if (!_data.temp) {
            return [this.command, uri.fsPath];
        }
        const tempFolder = tmpdir();
        this.parsedTemp = _data.temp as ParsedPath;
        const tempPath = `${tempFolder}\\auto-tfs-diff.temp${this.parsedTemp.ext}`;
        this.tempPath = tempPath;
        return [this.command, uri.fsPath, `/output:${tempPath}`];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        const handler = new ViewProcessHandler();
        handler.parsedTemp = this.parsedTemp;
        handler.uri = this.uri;
        handler.tempPath = this.tempPath;
        return handler;
    }
}