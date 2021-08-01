import { ProcessHandler } from '../../handler/process_handler';
import { InfoProcessHandler } from '../../handler/impl/info_process_handler';
import { TfsCommandBase } from './tfs_command_base';

export class InfoTfsCommand extends TfsCommandBase {

    public override readonly command = 'info';

    public override getConsoleDataHandler(): ProcessHandler {
        return new InfoProcessHandler();
    }
}