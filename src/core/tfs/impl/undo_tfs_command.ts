import { TfsCommand } from "../tfs_command";
import * as vscode from "vscode";
import { UndoProcessHandler } from "../../handler/impl/undo_process_handler";
import { ProcessHandler } from "../../handler/process_handler";

export class UndoTfsCommand implements TfsCommand {
    public getCommandAndArgs(): string[] {
        return ["undo", vscode.window.activeTextEditor.document.uri.fsPath];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new UndoProcessHandler();
    }
}