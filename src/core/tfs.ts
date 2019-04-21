import { CheckoutTfsCommand } from "./tfs/impl/checkout_tfs_command";
import { TfsCommand } from "./tfs/tfs_command";
import { Process } from "./process";
import * as vscode from 'vscode';
import { UndoTfsCommand } from "./tfs/impl/undo_tfs_command";
import { RollbackTfsCommand } from "./tfs/impl/rollback_tfs_command";
import { AddTfsCommand } from "./tfs/impl/add_tfs_command";

export class Tfs {
    private tfPath = vscode.workspace.getConfiguration("tfs").get("location") as string;

    public checkOut(): void {
        this.executeCommand(new CheckoutTfsCommand());
    }

    public undo(): void {
        this.executeCommand(new UndoTfsCommand());
    }

    public rollback(): void {
        this.executeCommand(new RollbackTfsCommand());
    }

    public add(): void {
        this.executeCommand(new AddTfsCommand());
    }

    private executeCommand(command: TfsCommand) {
        let processHandler = command.getConsoleDataHandler();
        let process = new Process();
        process.spawn(this.tfPath, command.getCommandAndArgs());
        processHandler.registerHandlers(process);
    }
}