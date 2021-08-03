import { TfsCommandBase } from './tfs-command-base';

export class DeleteTfsCommand extends TfsCommandBase {

    public override readonly command = 'delete';
}