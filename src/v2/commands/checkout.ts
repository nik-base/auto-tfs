import { Uri } from 'vscode';
import { TfsCommand } from './base-command';
import { Configuration } from '../configuration';

export class CheckoutCommand implements TfsCommand<Uri[], void> {
    public getCommandAndArgs(uris: Uri[], config: Configuration): string[] {
        const files = uris.map(uri => uri.fsPath);
        return ['checkout', ...files];
    }

    public handleOutput(output: string): void {
        // For checkout, we don't need to do anything with the output.
        // We can add logging here in the future if needed.
        console.log(output);
    }
}
