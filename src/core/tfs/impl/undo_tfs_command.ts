import { ProcessHandler } from '../../handler/process_handler';
import { UndoProcessHandler } from '../../handler/impl/undo_process_handler';
import { TfsCommandBase } from './tfs_command_base';

export class UndoTfsCommand extends TfsCommandBase {
    
    protected override readonly command = 'undo';

    public override getConsoleDataHandler(): ProcessHandler {
        return new UndoProcessHandler();
    }
}