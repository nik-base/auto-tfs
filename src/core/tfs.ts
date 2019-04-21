import { CheckoutTfsCommand } from "./tfs/impl/checkout_tfs_command";
import { TfsCommand } from "./tfs/tfs_command";
import { Process } from "./process";
import * as vscode from 'vscode';

export class Tfs {
    private tfPath = vscode.workspace.getConfiguration("tfs").get("location") as string;

    public checkOut(): void {
        let tfs = new Tfs();
        tfs.executeCommand(new CheckoutTfsCommand());
    }

    private executeCommand(command: TfsCommand) {
        let processHandler = command.getConsoleDataHandler();
        var process = new Process();
        process.spawn(this.tfPath, command.getCommandAndArgs());
        processHandler.registerHandlers(process);
    }
}