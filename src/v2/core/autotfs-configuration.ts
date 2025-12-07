import { workspace, WorkspaceConfiguration } from "vscode";

export class AutoTFSConfiguration {
  public static get tfPath(): string | undefined {
    return this.config.get("tf.path");
  }

  public static get tfLanguage(): string | undefined {
    return this.config.get("tf.language");
  }

  public static get shouldConfirm(): boolean {
    return this.config.get("tfs.confirm") ?? false;
  }

  public static get autoCheckoutMode(): string {
    return this.config.get("tfs.autoCheckout") ?? "Never";
  }

  public static get isAutoAddEnabled(): boolean {
    return this.config.get("tfs.autoAdd") ?? false;
  }

  public static get isAutoDeleteEnabled(): boolean {
    return this.config.get("tfs.autoDelete") ?? false;
  }

  public static get isAutoRenameEnabled(): boolean {
    return this.config.get("tfs.autoRename") ?? false;
  }

  public static get isAutoSyncEnabled(): boolean {
    return this.config.get("tfs.autoSync") ?? false;
  }

  public static get isQuickDiffEnabled(): boolean {
    return this.config.get("tfs.quickDiff") ?? false;
  }

  public static get checkinMode(): string {
    return this.config.get("tfs.checkin") ?? "Disabled";
  }

  public static get isDebugEnabled(): boolean {
    return this.config.get("tfs.debug") ?? false;
  }

  private static get config(): WorkspaceConfiguration {
    return workspace.getConfiguration("auto-tfs");
  }
}
