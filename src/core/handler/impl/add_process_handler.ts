import { ProcessHandler } from '../process_handler';
import { AbstractProcessHandler } from './abstract_process_handler';

export class AddProcessHandler extends AbstractProcessHandler implements ProcessHandler {
    public handleStdErrData(data: string): void {
        this.logger.logDebugData(data);
        super.handleStdErrData(data);
        this.message.error("Please, save the file first and check TFS workspace settings / mappings");
    }
}