import * as cp from 'child_process';

export class Process {
    private childProcess: cp.ChildProcess;

    public spawn(executablePath: string, args: string[]) : void {
        this.childProcess = cp.spawn(executablePath, args);
    }

    public writeLn(input: string): void {
        this.write(input);
        this.childProcess.stdin.write("\n");
    }

    public write(input: string): void {
        this.childProcess.stdin.write(input);
    }

    public dispose() : void {
        this.childProcess.stdin.end();
    }

    public registerErrorHandler(func : (data : string) => void) : void {
        this.childProcess.stderr.on("data", (data) => func(data.toString()));
    }

    public registerOutDataHandler(func : (data : string) => void) : void {
        this.childProcess.stdout.on("data", (data) => func(data.toString()));
    }

    public registerExitHandler(func : (exitCode : number) => void) : void {
        this.childProcess.on("exit", (exitCode) => func(exitCode));
    }
}
