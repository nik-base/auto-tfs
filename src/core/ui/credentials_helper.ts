import * as vscode from 'vscode';
import { Credentials } from '../credentials/credentials';

export class CredentialsHelper {

    private credentials: Credentials = new Credentials();

    public obtainCredentials(): Credentials {
        this.provideUserNameAndPasswor();
        return this.credentials;
    }

    private provideUserNameAndPasswor(): void {
        let thenable = this.getInputBoxValueThenable("Please, enter user name", false);
        thenable.then((userName) => {
            this.credentials.setUserName(userName);
            this.providePassword();
        });
    }

    private providePassword(): void {
        let thenable = this.getInputBoxValueThenable("Please, enter password", true);
        thenable.then((password) => {
            this.credentials.setPassword(password);
        });
    }

    private getInputBoxValueThenable(initialInput: string, isPassword: boolean): Thenable<string> {
        let userInput = vscode.window.showInputBox({
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