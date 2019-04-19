import * as vscode from 'vscode';
import { CredentialsHelper } from '../../ui/credentials_helper';
import { ProcessHandler } from '../process_handler';
import { AbstractProcessHandler } from './abstract_process_handler';

export class CheckoutProcessHandler extends AbstractProcessHandler implements ProcessHandler {
    private activeFileName = vscode.window.activeTextEditor.document.fileName;
    private credentialsHelper = new CredentialsHelper();

    public handleOutData(data: string): void {
        if (data.indexOf("Username") > -1) {
            let credentials = this.credentialsHelper.obtainCredentials();
            this.ioOperation.writeLn(credentials.getUserName());
            this.ioOperation.writeLn(credentials.getPassword());
        }
        if (data.indexOf(this.activeFileName) > -1) {
            // TODO Show message that successfully checked in
        }
    }

    public handleError(data: string): void {
        // TODO
    }

    public handleExit(exitCode: number): void {
        this.ioOperation.dispose();
        console.log("done");
    }
}