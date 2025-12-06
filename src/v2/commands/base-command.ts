import { Uri } from 'vscode';
import { Configuration } from '../configuration';

export interface TfsCommand<T, R> {
    shell?: boolean;
    getCommandAndArgs(item: T, config: Configuration): string[];
    handleOutput(output: string, item?: T): R;
}
