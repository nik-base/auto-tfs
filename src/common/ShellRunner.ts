import * as cp from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import { Logger } from './Logger';

const execFileAsync = promisify(cp.execFile);

export class ShellRunner {
    constructor(private tfPath: string) {}

    /**
     * Executes a TF command asynchronously.
     * @param args Arguments for TF.exe (e.g. ['checkout', 'file.cs'])
     * @param fileContextPath The path of the file being acted upon (to determine CWD)
     */
    async run(args: string[], fileContextPath: string): Promise<string> {
        const cwd = path.dirname(fileContextPath);

        Logger.log(`Running: ${this.tfPath} ${args.join(' ')}`);

        try {
            const { stdout, stderr } = await execFileAsync(this.tfPath, args, {
                cwd: cwd,
                windowsHide: true
            });

            if (stderr && stderr.trim().length > 0) {
                Logger.log(`Warning/Stderr: ${stderr}`);
            }

            return stdout;
        } catch (error: any) {
            // TF.exe returns exit code 100 for "Nothing to do", which isn't really an error
            if (error.code === 100) {
                return "Nothing to do";
            }
            throw new Error(error.message || error);
        }
    }
}
