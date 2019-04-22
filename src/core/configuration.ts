import * as vscode from "vscode";

export class Configuration {
    public getTfPath(): string {
        return vscode.workspace.getConfiguration("z-tf-util").get("tf.path");
    }

    public isDebugEnabled(): boolean {
        return vscode.workspace.getConfiguration("z-tf-util").get("debug");
    }
}