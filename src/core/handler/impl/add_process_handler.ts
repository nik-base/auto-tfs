import { ProcessHandler } from '../process_handler';
import { AbstractProcessHandler } from './abstract_process_handler';
import * as vscode from "vscode";

export class AddProcessHandler extends AbstractProcessHandler implements ProcessHandler {
    public handleError(data: string): void {
        super.handleError(data);
        vscode.window.showErrorMessage("Please, save the file first and check TFS workspace settings / mappings");
    }
}