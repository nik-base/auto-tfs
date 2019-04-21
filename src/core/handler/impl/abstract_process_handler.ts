import { ProcessHandler } from "../process_handler";
import { Process } from "../../process";
import { CredentialsHelper } from "../../ui/credentials_helper";
import { Credentials } from "../../credentials/credentials";
import * as vscode from "vscode";

export abstract class AbstractProcessHandler implements ProcessHandler {
    protected process: Process;
    private credentialsHelper = new CredentialsHelper();
    private credentialsPromise: Promise<Credentials>;
    private supressErrors : ["local echo", "Auth"];

    public handleOutData(data: string): void {
        this.handleAuthorize(data);
    }

    public handleError(data: string): void {
        if (!this.isSuppressedError(data)) {
            vscode.window.showErrorMessage("TF command error: " + data);
        }
    }

    public handleExit(exitCode: number): void {
        if (exitCode == 0) {
            vscode.window.showInformationMessage("The operation is successfully done");
        }
    }

    public registerHandlers(process: Process) {
        this.process = process;
        process.registerOutDataHandler(this.handleOutData.bind(this));
        process.registerErrorHandler(this.handleError.bind(this));
        process.registerExitHandler(this.handleExit.bind(this));
    }

    protected handleAuthorize(processStdOut: string) {
        this.handleUserNameAndObtainCredentials(processStdOut);
        this.handlePassword(processStdOut);
    }

    private handleUserNameAndObtainCredentials(processStdOut: string) {
        if (processStdOut.indexOf("Username") > -1) {
            vscode.window.showWarningMessage("Please, provide your TFS credentials for proceeding");
            this.credentialsPromise = this.credentialsHelper.obtainCredentials();
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getUserName());
            });
        }
    }

    private handlePassword(processStdOut: string) {
        if (processStdOut.indexOf("Password") > -1) {
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getPassword());
            });
        }
    }

    private isSuppressedError(processStdOut: string) : boolean {
        return this.supressErrors.some(item => processStdOut.indexOf(item) > -1);
    }
}