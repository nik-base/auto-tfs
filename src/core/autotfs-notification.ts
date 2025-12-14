import { window } from 'vscode';

export class AutoTFSNotification {
  public static info<T extends string = string>(
    message: string,
    ...items: T[]
  ): Thenable<T | undefined> {
    return window.showInformationMessage<T>(message, ...items);
  }

  public static warning<T extends string>(
    message: string,
    ...items: T[]
  ): Thenable<T | undefined> {
    return window.showWarningMessage<T>(message, ...items);
  }

  public static error<T extends string = string>(
    message: string,
    ...items: T[]
  ): Thenable<T | undefined> {
    return window.showErrorMessage<T>(message, ...items);
  }
}
