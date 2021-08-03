import { TfsCommandBase } from './tfs-command-base';

export class UndoTfsCommand extends TfsCommandBase {

    public override readonly command = 'undo';
}