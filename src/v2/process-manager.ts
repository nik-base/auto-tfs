import { spawn, spawnSync, ChildProcess, SpawnOptions, SpawnSyncOptionsWithStringEncoding } from 'child_process';

export interface ProcessResult {
    stdout: string;
    stderr: string;
    error?: Error;
}

export class TfsProcessManager {
    public spawnAsync(executablePath: string, args: string[], shell?: boolean): Promise<ProcessResult> {
        return new Promise((resolve, reject) => {
            const options: SpawnOptions = {
                shell: shell
            };
            const child = spawn(executablePath, args, options);
            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('error', (error) => {
                reject({
                    stdout,
                    stderr,
                    error
                });
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        stdout,
                        stderr
                    });
                } else {
                    reject({
                        stdout,
                        stderr,
                        error: new Error(`Process exited with code ${code}`)
                    });
                }
            });
        });
    }

    public spawnSync(executablePath: string, args: string[], shell?: boolean): ProcessResult {
        const options: SpawnSyncOptionsWithStringEncoding = {
            encoding: 'utf8',
            shell: shell
        };
        const result = spawnSync(executablePath, args, options);
        return {
            stdout: result.stdout?.toString() ?? '',
            stderr: result.stderr?.toString() ?? '',
            error: result.error
        };
    }
}
