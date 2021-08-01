import { ProcessHandler } from '../../handler/process_handler';
import { AddProcessHandler } from '../../handler/impl/add_process_handler';
import { TfsCommandBase } from './tfs_command_base';

export class AddTfsCommand extends TfsCommandBase {

    public override readonly command = 'add';

    public override getConsoleDataHandler(): ProcessHandler {
        return new AddProcessHandler();
    }
}