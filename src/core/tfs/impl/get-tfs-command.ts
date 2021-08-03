import { TfsCommandBase } from './tfs-command-base';

export class GetTfsCommand extends TfsCommandBase {

    public override readonly command = 'get';
}