import * as vscode from 'vscode';

export class Configuration {
    private static getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('auto-tfs');
    }

    static get tfPath(): string {
        return this.getConfiguration().get<string>('tf.path');
    }

    static get autoCheckout(): "On Save" | "On Change" | "Never" {
        return this.getConfiguration().get<"On Save" | "On Change" | "Never">('tfs.autoCheckout');
    }

    static get isAutoAddEnabled(): boolean {
        return this.getConfiguration().get<boolean>('tfs.autoAdd');
    }

    static get isAutoDeleteEnabled(): boolean {
        return this.getConfiguration().get<boolean>('tfs.autoDelete');
    }

    static get isAutoRenameEnabled(): boolean {
        return this.getConfiguration().get<boolean>('tfs.autoRename');
    }
}
