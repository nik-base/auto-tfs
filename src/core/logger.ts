import { Configuration } from './configuration';
import { OutputChannel } from './output-channel';

export class Logger {
    private configuration = new Configuration();

    public logDebugData(data: any): void {
        if (this.configuration.isDebugEnabled()) {
            console.log(data);
            OutputChannel.logJson(data);
        }
    }

    public tryAndLogWithException<T>(func: () => T): T | undefined {
        try {
            return func();
        } catch (e) {
            if (this.configuration.isDebugEnabled()) {
                console.log(e);
                OutputChannel.logJson(e);
            }
            return;
        }
    }
}