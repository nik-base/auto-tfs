import { TfsCommandBase } from './tfs-command-base';
import { Uri } from 'vscode';
import { CheckinProcessHandler } from '../../handler/impl/checkin-process-handler';
import { ProcessHandler } from '../../handler/process-handler';
import { Configuration } from '../../configuration';

export class CheckinTfsCommand extends TfsCommandBase {

    public override readonly command = 'checkin';

    public override getCommandAndArgs(uriList: readonly Uri[], _data: any): string[] {
        if (!uriList?.length) {
            return [];
        }
        if (!new Configuration().tfCheckin() || new Configuration().tfCheckin() === 'Disabled') {
            return [];
        }
        if (!_data?.comment) {
            return [];
        }
        if (new Configuration().tfCheckin() === 'Without Prompt') {
            const escapedPath = uriList.map(m => decodeURI(m.fsPath));
            return [this.command, `/comment:"${_data.comment}"`, '/noprompt', ...escapedPath];
        }
        const paths = uriList.map(m => `"${m.fsPath}"`);
        return [this.command, `/comment:"${_data.comment}"`, ...paths];
    }

    public override getConsoleDataHandler(): ProcessHandler {
        return new CheckinProcessHandler();
    }
}