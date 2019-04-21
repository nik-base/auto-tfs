import { ProcessHandler } from '../process_handler';
import { AbstractProcessHandler } from './abstract_process_handler';

export class CheckoutProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public handleOutData(data: string): void {
        this.handleAuthorize(data);
    }

    public handleError(data: string): void {
        //console.log(data);
    }
}