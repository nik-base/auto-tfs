import { ProcessHandler } from '../../handler/process-handler';
import { DeleteProcessHandler } from '../../handler/impl/delete-process-handler';
import { TfsCommandBase } from './tfs-command-base';

export class DeleteTfsCommand extends TfsCommandBase {

    public override readonly command = 'delete';

    public override getConsoleDataHandler(): ProcessHandler {
        return new DeleteProcessHandler();
    }
}