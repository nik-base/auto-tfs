import { spawn, spawnSync, ChildProcess, SpawnOptions } from 'child_process';
import { OutputChannel } from './output-channel';
import { TfsCommand } from './tfs/tfs-command';

export class Process {
    private childProcess!: ChildProcess;
    private commandName!: string;
    private command?: TfsCommand;

    constructor(command?: TfsCommand) {
        this.command = command;
    }

    public spawn(executablePath: string, args: string[]): void {
        this.commandName = args[0]; // The first arg is always a command
        this.childProcess = spawn(executablePath, args);
    }

    public spawnShell(executablePath: string, args: string[]): void {
        this.commandName = args[0]; // The first arg is always a command
        const options = <SpawnOptions>{
            detached: true,
            shell: true
        };
        this.childProcess = spawn(`"${executablePath}"`, args, options);
    }

    public spawnSync(executablePath: string, args: string[]): string {
        const message = `TF command '${this.getCommandName()}' is in progress...`;
        OutputChannel.log(message);
        this.commandName = args[0]; // The first arg is always a command
        const result =  spawnSync(executablePath, args);
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
        return this.command?.displayName() ?? this.commandName!;
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
