import { spawn, spawnSync, ChildProcess } from 'child_process';
import { OutputChannel } from './output-channel';

export class Process {
    private childProcess!: ChildProcess;
    private commandName!: string;

    public spawn(executablePath: string, args: string[]): void {
        this.commandName = args[0]; // The first arg is always a command
        this.childProcess = spawn(executablePath, args);
    }

    public spawnSync(executablePath: string, args: string[]): string {
        this.commandName = args[0]; // The first arg is always a command
        const result = spawnSync(executablePath, args);
        const stdOut = result.stdout;
        OutputChannel.log(stdOut);
        const info = `TF command '${this.getCommandName()}' is successfully done`;
        OutputChannel.log(info);
        return stdOut;
    }

    public writeLn(input: string): void {
        this.write(input);
        this.write('\n');
    }

    public write(input: string): void {
        if (!input) {
            return;
        }
        this.childProcess.stdin!.write(input);
    }

    public getCommandName(): string {
        return this.commandName!;
    }

    public kill(): void {
        if (!this.isKilled()) {
            this.childProcess.kill('SIGKILL');
        }
    }

    public isKilled(): boolean {
        return this.childProcess.killed;
    }

    public registerStdErrDataHandler(func: (data: string) => void): void {
        this.childProcess.stderr!.on('data', (data) => func(data.toString()));
    }

    public registerStdOutDataHandler(func: (data: string) => void): void {
        this.childProcess.stdout!.on('data', (data) => func(data.toString()));
    }

    public registerExitHandler(func: (exitCode: number) => void): void {
        this.childProcess.on('exit', (exitCode) => func(exitCode!));
    }

    public registerErrorHandler(func: (error: Error) => void): void {
        this.childProcess.on('error', (data) => func(data));
    }
}
