import { CheckoutTfsCommand } from "./tfs/impl/checkout_tfs_command";
import { TfsCommand } from "./tfs/tfs_command";
import { Process } from "./process";
import * as vscode from 'vscode';
import { UndoTfsCommand } from "./tfs/impl/undo_tfs_command";
import { AddTfsCommand } from "./tfs/impl/add_tfs_command";
import { DeleteTfsCommand } from "./tfs/impl/delete_tfs_command";

export class Tfs {
    private tfPath = vscode.workspace.getConfiguration("tfs").get("location") as string;

    public checkOut(): void {
        this.executeCommand(new CheckoutTfsCommand());
    }

    public undo(): void {
        this.executeCommand(new UndoTfsCommand());
    }

    public add(): void {
        this.executeCommand(new AddTfsCommand());
    }

    public delete(): void {
        let thenableAction = vscode.window.showWarningMessage("Do you really want to delete current file?", "Yes", "No");
        thenableAction.then((selectedItem) => {
            if (selectedItem == "Yes") {
                this.executeCommand(new DeleteTfsCommand());
            }
        });
    }

    private executeCommand(command: TfsCommand) {
        let processHandler = command.getConsoleDataHandler();
        let process = new Process();
        process.spawn(this.tfPath, command.getCommandAndArgs());
        processHandler.registerHandlers(process);
    }
}