import { TfsCommand } from "../tfs_command";
import * as vscode from "vscode";
import { ProcessHandler } from "../../handler/process_handler";
import { AddProcessHandler } from "../../handler/impl/add_process_handler";

export class AddTfsCommand implements TfsCommand {
    public getCommandAndArgs(): string[] {
        return ["add", vscode.window.activeTextEditor.document.uri.fsPath];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new AddProcessHandler();
    }
}