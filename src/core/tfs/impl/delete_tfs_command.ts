import { TfsCommand } from "../tfs_command";
import * as vscode from "vscode";
import { ProcessHandler } from "../../handler/process_handler";
import { DeleteProcessHandler } from "../../handler/impl/delete_process_handler";

export class DeleteTfsCommand implements TfsCommand {
    public getCommandAndArgs(): string[] {
        return ["delete", vscode.window.activeTextEditor.document.uri.fsPath];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new DeleteProcessHandler();
    }
}