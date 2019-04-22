import { ProcessHandler } from "../process_handler";
import { Process } from "../../process";
import { CredentialsHelper } from "../../ui/credentials_helper";
import { Credentials } from "../../credentials/credentials";
import * as vscode from "vscode";

export abstract class AbstractProcessHandler implements ProcessHandler {
    protected process: Process;
    private credentialsHelper = new CredentialsHelper();
    private credentialsPromise: Promise<Credentials>;
    private suppressedErrors: ["local echo", "Access denied"];

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

    protected handleAuthorize(processStdOutData: string) {
        this.handleUserNameAndObtainCredentials(processStdOutData);
        this.handlePassword(processStdOutData);
    }

    private handleUserNameAndObtainCredentials(processStdOutData: string) {
        if (processStdOutData.indexOf("Username") > -1) {
            vscode.window.showWarningMessage("Please, provide your TFS credentials for proceeding");
            this.credentialsPromise = this.credentialsHelper.obtainCredentials();
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getUserName());
            });
        }
    }

    private handlePassword(processStdOutData: string) {
        if (processStdOutData.indexOf("Password") > -1) {
            this.credentialsPromise.then((credentials) => {
                this.process.writeLn(credentials.getPassword());
            });
        }
    }

    private isSuppressedError(processStdOutData: string): boolean {
        return this.suppressedErrors.some(item => processStdOutData.indexOf(item) > -1);
    }
}