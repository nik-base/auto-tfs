import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { Configuration } from '../configuration';

export class StatusBar {

    private static sync: StatusBarItem;

    private static getAll: StatusBarItem;

    public static initSync(): StatusBarItem {
        if (!new Configuration().getTfPath()) {
            return this.sync;
        }
        this.sync = window.createStatusBarItem('auto-tfs-sync', StatusBarAlignment.Left, 10);
        this.sync.text = `$(sync)`;
        this.sync.tooltip = `Auto TFS: Sync Changes`;
        this.sync.command = 'auto-tfs.sync';
        this.sync.show();
        return this.sync;
    }

    public static initGetAll(): StatusBarItem {
        if (!new Configuration().getTfPath()) {
            return this.getAll;
        }
        this.getAll = window.createStatusBarItem('auto-tfs-getall', StatusBarAlignment.Left, 11);
        this.getAll.text = `$(cloud-download)`;
        this.getAll.tooltip = `Auto TFS: Get All Latest`;
        this.getAll.command = 'auto-tfs.getall';
        this.getAll.show();
        return this.getAll;
    }

    public static startSync(): void {
        this.sync.text = `$(sync~spin)`;
    }

    public static stopSync(): void {
        setTimeout(() => {
        this.sync.text = `$(sync)`;
        }, 700);
    }

    public static startGetAll(): void {
        this.getAll.text = `$(loading~spin)`;
    }

    public static stopGetAll(): void {
        setTimeout(() => {
            this.getAll.text = `$(cloud-download)`;
            }, 700);
    }
}