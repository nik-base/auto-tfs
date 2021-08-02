import { OutputChannel } from '../../output-channel';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

export class InfoProcessHandler extends AbstractProcessHandler implements ProcessHandler {
    public override showMessageOnUI = false;
    public override handleStdOutData(data: string): void {
        this.data = this.getData(data);
        super.handleStdOutData(data);
    }

    public getData(data: string): string | null {
        try {
            const result = this.getChangeType(data);
            OutputChannel.log(result!);
            return result;
        } catch (e) {
            OutputChannel.log(e);
            return null;
        }
    }

    public getChangeType(data: string): string | null {
        const regex = /[\n\r]*Change *: *(.*)[\n\r]/i;
        const match = data?.toString()?.match(regex)!;
        if (match?.length >= 2) {
            return match[1]?.toLocaleLowerCase();
        }
        return null;
    }
}