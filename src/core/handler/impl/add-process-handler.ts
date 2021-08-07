import { OutputChannel } from '../../output-channel';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

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