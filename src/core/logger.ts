import { Configuration } from "./configuration";

export class Logger {
    private configuration = new Configuration();

    public logDebugData(data: any): void {
        if (this.configuration.isDebugEnabled()) {
            console.log(data);
        }
    }

    public tryAndLogWithException<T>(func: () => T): T {
        try {
            return func();
        } catch (e) {
            if (this.configuration.isDebugEnabled()) {
                console.log(e);
            }
        }
    }
}