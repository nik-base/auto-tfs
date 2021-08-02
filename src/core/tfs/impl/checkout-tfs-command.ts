import { ProcessHandler } from '../../handler/process-handler';
import { CheckoutProcessHandler } from '../../handler/impl/checkout-process-handler';
import { TfsCommandBase } from './tfs-command-base';

export class CheckoutTfsCommand extends TfsCommandBase {

    public override readonly command = 'checkout';

    public override getConsoleDataHandler(): ProcessHandler {
        return new CheckoutProcessHandler();
    }
}