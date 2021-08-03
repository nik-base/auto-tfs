import { ProcessHandler } from '../../handler/process-handler';
import { InfoProcessHandler } from '../../handler/impl/info-process-handler';
import { TfsCommandBase } from './tfs-command-base';

export class InfoTfsCommand extends TfsCommandBase {

    public override readonly command = 'info';

    public override getConsoleDataHandler(): ProcessHandler {
        return new InfoProcessHandler();
    }
}