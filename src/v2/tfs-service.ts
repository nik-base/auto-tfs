import { Configuration } from './configuration';
import { TfsProcessManager } from './process-manager';
import { TfsCommand } from './commands/base-command';
import { Uri } from 'vscode';

export class TfsService {
    constructor(
        private processManager: TfsProcessManager,
        private configuration: Configuration
    ) {}

    public async execute<T, R>(command: TfsCommand<T, R>, item: T): Promise<R> {
        const tfPath = this.configuration.getTfPath();
        if (!tfPath) {
            throw new Error('TF command path is not configured.');
        }

        const args = command.getCommandAndArgs(item, this.configuration);
        
        try {
            const result = await this.processManager.spawnAsync(tfPath, args, command.shell);
            if (result.stderr) {
                // For now, we'll just log stderr to the console.
                // In the future, we can add more robust error handling.
                console.error(result.stderr);
            }
            return command.handleOutput(result.stdout, item);
        } catch (err: any) {
            if (err.stderr) {
                console.error(err.stderr);
            }
            throw err.error || new Error('TFS command failed.');
        }
    }
}
