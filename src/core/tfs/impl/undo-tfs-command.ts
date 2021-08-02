import { ProcessHandler } from '../../handler/process-handler';
import { UndoProcessHandler } from '../../handler/impl/undo-process-handler';
import { TfsCommandBase } from './tfs-command-base';

export class UndoTfsCommand extends TfsCommandBase {

    public override readonly command = 'undo';

    public override getConsoleDataHandler(): ProcessHandler {
        return new UndoProcessHandler();
    }
}