import * as cp from 'child_process';
import { Utils } from './utils';

export class IOOperation {
    private execTimeoutAttemptsPerSecond: 30;
    private utils : Utils;

    private childProcess : cp.ChildProcess;
    private stdOutValue : string;
    private waitTexts : string[];

    constructor(executablePath: string, args: string[], waitTexts : string[]) {
        this.childProcess = cp.spawn(executablePath, args);
        this.waitTexts = waitTexts;
        this.initEvents();
    }

    public writeLn(input : string) : void {
        this.write(input);
        this.childProcess.stdin.write("\n");
    }

    public write(input : string) : void {        
        this.childProcess.stdin.write(String);
    }

    public getStdOutValue() : string {
        this.waitOutput();
        return this.stdOutValue;
    }

    public finish() : void {
        this.childProcess.stdin.end();
    }

    private initEvents() : void {
        this.childProcess.stdout.on("data", (data) => {
            this.stdOutValue = data.toString();
        });
    }

    private waitOutput(func ) : void {
        let counter = this.execTimeoutAttemptsPerSecond;
        let interval = setInterval(() => {
            counter--;
            if (counter < 0 || this.utils.isStringInArray(this.stdOutValue, this.waitTexts)) {
                clearInterval(interval);
            }
        }, 1000);
    }
}