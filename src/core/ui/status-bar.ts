import { Command, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { Configuration } from '../configuration';

export class StatusBar {

    private static sync: StatusBarItem;

    private static getAll: StatusBarItem;

    public static initSync(): StatusBarItem {
        this.sync = this.init(this.sync, 'auto-tfs-sync', StatusBarAlignment.Left, 10, this.getSyncCommand.bind(this));
        return this.sync;
    }

    private static init(statusBar: StatusBarItem, name: string, alignment: StatusBarAlignment
        , priority: number,  commandFunction: () => Command): StatusBarItem {
        if (!new Configuration().getTfPath()) {
            return statusBar;
        }
        statusBar = window.createStatusBarItem(name, alignment, priority);
        const command = commandFunction();
        statusBar.text = command.title;
        statusBar.tooltip = command.tooltip;
        statusBar.command = command.command;
        statusBar.show();
        return statusBar;
    }

    public static getSyncCommand(): Command {
        return this.getCommand('auto-tfs.sync', '$(sync)', 'Sync');
    }

    public static getGetAllCommand(): Command {
        return this.getCommand('auto-tfs.getall', '$(cloud-download)', 'Get All Latest');
    }

    private static getCommand(command: string, title: string, tooltip: string): Command {
        return <Command> {
            command: command,
            title: title,
            tooltip: tooltip
        };
    }

    public static getSpinningSyncCommand(): Command {
        return this.getCommand('', '$(sync~spin)', 'Syncing...');
    }

    public static getSpinningGetAllCommand(): Command {
        return this.getCommand('', '$(loading~spin)', 'Getting...');
    }

    public static initGetAll(): StatusBarItem {
        this.getAll = this.init(this.getAll, 'auto-tfs-getall', StatusBarAlignment.Left, 11, this.getGetAllCommand.bind(this));
        return this.getAll;
    }

    public static startSync(): void {
        return this.spin(this.sync, this.getSpinningSyncCommand.bind(this));
    }

    private static spin(statusBar: StatusBarItem, spinCommandFunction: () => Command): void {
        const command = spinCommandFunction();
        statusBar.text = command.title;
        statusBar.tooltip = command.tooltip;
        statusBar.command = command.command;
    }

    public static stopSync(): void {
        this.stopSpin(this.sync, this.getSyncCommand.bind(this));
    }

    public static startGetAll(): void {
        return this.spin(this.getAll, this.getSpinningGetAllCommand.bind(this));
    }

    public static stopGetAll(): void {
        this.stopSpin(this.getAll, this.getGetAllCommand.bind(this));
    }

    private static stopSpin(statusBar: StatusBarItem, commandFunction: () => Command): void {
        const command = commandFunction();
        setTimeout(() => {
            statusBar.text = command.title;
            statusBar.tooltip = command.tooltip;
            statusBar.command = command.command;
            }, 700);
    }
}