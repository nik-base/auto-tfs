import { ProcessHandler } from '../../handler/process_handler';
import { CheckoutProcessHandler } from '../../handler/impl/checkout_process_handler';
import { TfsCommandBase } from './tfs_command_base';

export class CheckoutTfsCommand extends TfsCommandBase {

    public override readonly command = 'checkout';

    public override getConsoleDataHandler(): ProcessHandler {
        return new CheckoutProcessHandler();
    }
}