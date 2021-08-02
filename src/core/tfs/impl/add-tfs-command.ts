import { ProcessHandler } from '../../handler/process-handler';
import { AddProcessHandler } from '../../handler/impl/add-process-handler';
import { TfsCommandBase } from './tfs-command-base';

export class AddTfsCommand extends TfsCommandBase {

    public override readonly command = 'add';

    public override getConsoleDataHandler(): ProcessHandler {
        return new AddProcessHandler();
    }
}