import * as cp from 'child_process';
import { Logger } from './logger';

export class Process {
    private childProcess: cp.ChildProcess;
    private commandName: string;
    private logger = new Logger();

    public spawn(executablePath: string, args: string[]): void {
        this.commandName = args[0]; // The first arg is always a command
        this.childProcess = cp.spawn(executablePath, args);
    }

    public writeLn(input: string): void {
        this.write(input);
        this.write("\n");
    }

    public write(input: string): void {
        input && this.childProcess.stdin.write(input);
    }

    public getCommandName(): string {
        return this.commandName;
    }

    public kill(): void {
        if (!this.isKilled()) {
            this.childProcess.kill("SIGKILL");
        }
    }

    public isKilled(): boolean {
        return this.childProcess.killed;
    }

    public registerStdErrDataHandler(func: (data: string) => void): void {
        this.childProcess.stderr.on("data", (data) => func(data.toString()));
    }

    public registerStdOutDataHandler(func: (data: string) => void): void {
        this.childProcess.stdout.on("data", (data) => func(data.toString()));
    }

    public registerExitHandler(func: (exitCode: number) => void): void {
        this.childProcess.on("exit", (exitCode) => func(exitCode));
    }

    public registerErrorHandler(func: (error: Error) => void): void {
        this.childProcess.on("error", (data) => func(data));
    }
}
