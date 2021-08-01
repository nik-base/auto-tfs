import { OutputChannel } from '../../output_channel';
import { ProcessHandler } from '../process_handler';
import { AbstractProcessHandler } from './abstract_process_handler';

export class AddProcessHandler extends AbstractProcessHandler implements ProcessHandler {
    public override handleStdErrData(data: string): void {
        this.logger.logDebugData(data);
        OutputChannel.log(data);
        super.handleStdErrData(data);
        const message = 'Please, save the file first and check TFS workspace settings / mappings';
        this.message.error(message);
        OutputChannel.log(message);
    }
}