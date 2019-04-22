import { CheckoutTfsCommand } from "./tfs/impl/checkout_tfs_command";
import { TfsCommand } from "./tfs/tfs_command";
import { Process } from "./process";
import * as vscode from 'vscode';
import { UndoTfsCommand } from "./tfs/impl/undo_tfs_command";
import { AddTfsCommand } from "./tfs/impl/add_tfs_command";
import { DeleteTfsCommand } from "./tfs/impl/delete_tfs_command";
import { Configuration } from "./configuration";
import { Message } from "./ui/message";
import { Logger } from "./logger";

export class Tfs {
    private configuration = new Configuration();
    private message = new Message();
    private logger = new Logger();

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
        let thenableAction = this.message.warning("Do you really want to delete current file?", "Yes", "No");
        thenableAction.then((selectedItem) => {
            if (selectedItem == "Yes") {
                this.executeCommand(new DeleteTfsCommand());
            }
        });
    }

    private executeCommand(command: TfsCommand) {
        this.logger.tryAndLogWithException(() => {
            let processHandler = command.getConsoleDataHandler();
            let process = new Process();
            process.spawn(this.configuration.getTfPath(), command.getCommandAndArgs());
            this.message.info(`The TF command "${process.getCommandName()}" is in progress...`);
            processHandler.registerHandlers(process);
        });
    }
}