import { ProcessHandler } from "../handler/process_handler";
import * as vscode from "vscode";

export interface TfsCommand {
    command: string;
    getCommandAndArgs(): string[];
    getCommandAndArgsFile(uri: vscode.Uri, _data: any): string[];
    getConsoleDataHandler(): ProcessHandler;
}