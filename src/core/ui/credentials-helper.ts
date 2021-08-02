import { window } from 'vscode';
import { Credentials } from '../credentials/credentials';

export class CredentialsHelper {
    public async obtainCredentials(): Promise<Credentials> {
        const cred = new Credentials();

        cred.setUserName(await this.getInputBoxValuePromise('Please, enter user name', false) || '');
        cred.setPassword(await this.getInputBoxValuePromise('Please, enter password', true) || '');

        return cred;
    }

    private async getInputBoxValuePromise(initialInput: string, isPassword: boolean): Promise<string | undefined> {
        const userInput = await window.showInputBox({
            value: initialInput,
            password: isPassword,
            validateInput: (input: string): string | undefined | null | Thenable<string | undefined | null> => {
                if (input === initialInput || input.length === 0) {
                    return initialInput;
                }
                return null;
            }
        });

        return userInput;
    }
}