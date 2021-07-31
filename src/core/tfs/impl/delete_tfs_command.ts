import { ProcessHandler } from '../../handler/process_handler';
import { DeleteProcessHandler } from '../../handler/impl/delete_process_handler';
import { TfsCommandBase } from './tfs_command_base';

export class DeleteTfsCommand extends TfsCommandBase {

    protected override readonly command = 'delete';

    public override getConsoleDataHandler(): ProcessHandler {
        return new DeleteProcessHandler();
    }
}