import { Command, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';

export class AutoTFSStatusBar {
  private static sync: StatusBarItem;

  private static getAll: StatusBarItem;

  static initSync(): StatusBarItem {
    this.sync = this.init(
      this.sync,
      'auto-tfs-sync',
      StatusBarAlignment.Left,
      10,
      this.getSyncCommand.bind(this)
    );

    return this.sync;
  }

  static initGetAll(): StatusBarItem {
    this.getAll = this.init(
      this.getAll,
      'auto-tfs-getall',
      StatusBarAlignment.Left,
      11,
      this.getGetAllCommand.bind(this)
    );

    return this.getAll;
  }

  static getSyncCommand(): Command {
    return this.getCommand('auto-tfs.sync', '$(sync)', 'Auto TFS: Sync');
  }

  static getGetAllCommand(): Command {
    return this.getCommand(
      'auto-tfs.getall',
      '$(cloud-download)',
      'Auto TFS: Get All Latest'
    );
  }

  static startSync(): void {
    return this.spin(this.sync, this.getSpinningSyncCommand.bind(this));
  }

  static stopSync(): void {
    this.stopSpin(this.sync, this.getSyncCommand.bind(this));
  }

  static startGetAll(): void {
    return this.spin(this.getAll, this.getSpinningGetAllCommand.bind(this));
  }

  static stopGetAll(): void {
    this.stopSpin(this.getAll, this.getGetAllCommand.bind(this));
  }

  static getSpinningSyncCommand(): Command {
    return this.getCommand('', '$(sync~spin)', 'Auto TFS: Syncing...');
  }

  static getSpinningGetAllCommand(): Command {
    return this.getCommand('', '$(loading~spin)', 'Auto TFS: Getting...');
  }

  private static init(
    statusBar: StatusBarItem,
    name: string,
    alignment: StatusBarAlignment,
    priority: number,
    commandFunction: () => Command
  ): StatusBarItem {
    if (!AutoTFSConfiguration.tfPath) {
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

  private static getCommand(
    command: string,
    title: string,
    tooltip: string
  ): Command {
    return {
      command: command,
      title: title,
      tooltip: tooltip,
    };
  }

  private static spin(
    statusBar: StatusBarItem,
    spinCommandFunction: () => Command
  ): void {
    const command = spinCommandFunction();

    statusBar.text = command.title;
    statusBar.tooltip = command.tooltip;
    statusBar.command = command.command;
  }

  private static stopSpin(
    statusBar: StatusBarItem,
    commandFunction: () => Command
  ): void {
    const command = commandFunction();

    setTimeout(() => {
      statusBar.text = command.title;
      statusBar.tooltip = command.tooltip;
      statusBar.command = command.command;
    }, 700);
  }
}
