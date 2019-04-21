import { TfsCommand } from "../tfs_command";
import * as vscode from "vscode";
import { ProcessHandler } from "../../handler/process_handler";
import { RollbackProcessHandler } from "../../handler/impl/rollback_process_handler";

export class RollbackTfsCommand implements TfsCommand {
    public getCommandAndArgs(): string[] {
        return ["rollback", vscode.window.activeTextEditor.document.uri.fsPath];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new RollbackProcessHandler();
    }
}