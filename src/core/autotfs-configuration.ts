/* eslint-disable @typescript-eslint/member-ordering */
import { workspace, WorkspaceConfiguration } from 'vscode';
import {
  AutoTFSCheckinMode,
  AutoTFSCheckoutMode,
  AutoTFSLocale,
} from '../types';

export class AutoTFSConfiguration {
  private static cachedConfig: WorkspaceConfiguration | undefined;

  private static get config(): WorkspaceConfiguration {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    this.cachedConfig = workspace.getConfiguration('auto-tfs');

    return this.cachedConfig;
  }

  public static refresh(): void {
    this.cachedConfig = workspace.getConfiguration('auto-tfs');
  }

  public static get tfPath(): string | undefined {
    return this.config.get('tf.path');
  }

  public static get tfLanguage(): AutoTFSLocale {
    return this.config.get('tf.language') ?? 'English';
  }

  public static get shouldConfirm(): boolean {
    return this.config.get('tfs.confirm') ?? false;
  }

  public static get autoCheckoutMode(): AutoTFSCheckoutMode {
    return this.config.get('tfs.autoCheckout') ?? 'Never';
  }

  public static get isAutoAddEnabled(): boolean {
    return this.config.get('tfs.autoAdd') ?? false;
  }

  public static get isAutoDeleteEnabled(): boolean {
    return this.config.get('tfs.autoDelete') ?? false;
  }

  public static get isAutoRenameEnabled(): boolean {
    return this.config.get('tfs.autoRename') ?? false;
  }

  public static get isAutoSyncEnabled(): boolean {
    return this.config.get('tfs.autoSync') ?? false;
  }

  public static get isQuickDiffEnabled(): boolean {
    return this.config.get('tfs.quickDiff') ?? false;
  }

  public static get checkinMode(): AutoTFSCheckinMode {
    return this.config.get('tfs.checkin') ?? 'Disabled';
  }

  public static get isDebugEnabled(): boolean {
    return this.config.get('tfs.debug') ?? false;
  }
}
