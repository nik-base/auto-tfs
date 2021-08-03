import { TfsCommandBase } from './tfs-command-base';

export class CheckoutTfsCommand extends TfsCommandBase {

    public override readonly command = 'checkout';
}