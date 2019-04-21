import * as vscode from 'vscode';
import { Credentials } from '../credentials/credentials';

export class CredentialsHelper {
    public async obtainCredentials(): Promise<Credentials> {
        let cred = new Credentials();

        cred.setUserName(await this.getInputBoxValuePromise("Please, enter user name", false));
        cred.setPassword(await this.getInputBoxValuePromise("Please, enter password", true));

        return cred;
    }

    private async getInputBoxValuePromise(initialInput: string, isPassword: boolean): Promise<string> {
        let userInput = await vscode.window.showInputBox({
            value: initialInput,
            password: isPassword,
            validateInput: function (input) {
                if (input == initialInput || input.length == 0) {
                    return initialInput;
                }
            }
        });

        return userInput;
    }
}