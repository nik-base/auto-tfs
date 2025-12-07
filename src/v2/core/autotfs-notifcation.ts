import { window } from "vscode";

export class AutoTFSNotification {
  public static info(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> {
    return window.showInformationMessage(message, ...items);
  }

  public static warning(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> {
    return window.showWarningMessage(message, ...items);
  }

  public static error(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> {
    return window.showErrorMessage(message, ...items);
  }
}
