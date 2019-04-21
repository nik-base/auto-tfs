import { TfsCommand } from "../tfs_command";
import * as vscode from "vscode";
import { ProcessHandler } from "../../handler/process_handler";
import { CheckoutProcessHandler } from "../../handler/impl/checkout_process_handler";

export class CheckoutTfsCommand implements TfsCommand {
    public getCommandAndArgs(): string[] {
        return ["checkout", vscode.window.activeTextEditor.document.uri.fsPath];
    }

    public getConsoleDataHandler(): ProcessHandler {
        return new CheckoutProcessHandler();
    }
}