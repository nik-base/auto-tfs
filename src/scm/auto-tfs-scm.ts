import {
  Command,
  ExtensionContext,
  FileDecoration,
  scm,
  SourceControl,
  SourceControlResourceGroup,
  SourceControlResourceState,
  ThemeColor,
  Uri,
} from 'vscode';
import { join as pathJoin, dirname } from 'path';
import { SCMFileDecorator } from './scm-file-decorator';
import { SCMChange, SCMContext } from '../models';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';
import { AutoTFSStatusBar } from '../status-bar/auto-tfs-status-bar';
import { AutoTFSQuickDiffProvider } from './auto-tfs-quick-diff-provider';
import { SCMChangeType } from '../types';

const iconsRootPath = pathJoin(dirname(__dirname), 'resources', 'icons');

function getIconUri(iconName: string, theme: string): Uri {
  return Uri.file(pathJoin(iconsRootPath, theme, `${iconName}.svg`));
}

export class AutoTFSSCM {
  static fileDecorators = new Map<string, FileDecoration>();

  private static fileDecorationProvider = new SCMFileDecorator();

  private static sourceControl: SourceControl;

  private static extensionContext: ExtensionContext;

  private static included: SourceControlResourceGroup;

  private static excluded: SourceControlResourceGroup;

  static get includedChanges(): SourceControlResourceState[] {
    return this.included.resourceStates;
  }

  static get excludedChanges(): SourceControlResourceState[] {
    return this.excluded.resourceStates;
  }

  static init(context: ExtensionContext): SCMContext {
    this.extensionContext = context;

    if (!AutoTFSConfiguration.tfPath) {
      return {
        sourceControl: this.sourceControl,
        changes: {
          included: this.included,
          excluded: this.excluded,
        },
      };
    }

    this.fileDecorators.clear();

    this.sourceControl = scm.createSourceControl('auto-tfs', 'TFS');

    this.sourceControl.statusBarCommands = this.getStatusBarCommands();

    if (AutoTFSConfiguration.isQuickDiffEnabled) {
      this.sourceControl.quickDiffProvider =
        AutoTFSQuickDiffProvider.provider();
    }

    this.sourceControl.inputBox.placeholder = 'Check-in Comment / Shelve name';

    this.included = this.initGroup('included', 'Included');
    this.excluded = this.initGroup('excluded', 'Excluded');

    return {
      sourceControl: this.sourceControl,
      changes: {
        included: this.included,
        excluded: this.excluded,
      },
    };
  }

  static startSync(): void {
    this.updateStatusBarCommand(1, AutoTFSStatusBar.getSpinningSyncCommand());
  }

  static startGetAll(): void {
    this.updateStatusBarCommand(0, AutoTFSStatusBar.getSpinningGetAllCommand());
  }

  static stopSync(): void {
    setTimeout(() => {
      this.updateStatusBarCommand(1, AutoTFSStatusBar.getSyncCommand());
    }, 700);
  }

  static stopGetAll(): void {
    setTimeout(() => {
      this.updateStatusBarCommand(0, AutoTFSStatusBar.getGetAllCommand());
    }, 700);
  }

  static sync(changeList: readonly SCMChange[]): void {
    this.fileDecorators.clear();

    this.fileDecorationProvider.dispose();

    this.fileDecorationProvider = new SCMFileDecorator();

    const changes: SourceControlResourceState[] = [];

    for (const change of changeList) {
      this.processChange(change, changes);
    }

    this.updateChanges(changes);

    this.updateCountBadge();

    this.fileDecorationProvider.onDidChangeDecorations.fire(
      changeList.map((change: SCMChange): Uri => Uri.file(change.path))
    );
  }

  static exclude(...resources: SourceControlResourceState[]): void {
    const files: string[] = resources.map(
      (resource: SourceControlResourceState): string =>
        resource.resourceUri.fsPath
    );

    this.excluded.resourceStates = this.excluded.resourceStates.concat(
      ...resources
    );

    const included: SourceControlResourceState[] = this.negativefilter(
      this.included.resourceStates,
      files
    );

    this.included.resourceStates = [...included];

    this.updateCountBadge();

    this.updateWorkspaceExcluded();
  }

  static excludeAll(): void {
    this.excluded.resourceStates = this.excluded.resourceStates.concat(
      ...this.included.resourceStates
    );

    this.included.resourceStates = [];

    this.updateCountBadge();

    this.updateWorkspaceExcluded();
  }

  static include(...resources: SourceControlResourceState[]): void {
    const files: string[] = resources.map(
      (resource: SourceControlResourceState): string =>
        resource.resourceUri.fsPath
    );

    this.included.resourceStates = this.included.resourceStates.concat(
      ...resources
    );

    const excluded: SourceControlResourceState[] = this.negativefilter(
      this.excluded.resourceStates,
      files
    );

    this.excluded.resourceStates = [...excluded];

    this.updateCountBadge();

    this.updateWorkspaceExcluded();
  }

  static includeAll(): void {
    this.included.resourceStates = this.included.resourceStates.concat(
      ...this.excluded.resourceStates
    );

    this.excluded.resourceStates = [];

    this.updateCountBadge();

    this.updateWorkspaceExcluded();
  }

  private static updateStatusBarCommand(index: number, command: Command): void {
    const existingCommands: Command[] = this.getStatusBarCommands();

    const existingCommand: Command = existingCommands[index];

    existingCommand.command = command.command;
    existingCommand.title = command.title;
    existingCommand.tooltip = command.tooltip;

    this.sourceControl.statusBarCommands = existingCommands;
  }

  private static getStatusBarCommands(): Command[] {
    const getAllCommand: Command = AutoTFSStatusBar.getGetAllCommand();

    const syncCommand: Command = AutoTFSStatusBar.getSyncCommand();

    const shelveCommand: Command = this.getShelveCommand();

    if (AutoTFSConfiguration.checkinMode === 'Disabled') {
      return [getAllCommand, syncCommand, shelveCommand];
    }

    const checkinCommand: Command = this.getCheckinCommand();

    return [getAllCommand, syncCommand, shelveCommand, checkinCommand];
  }

  private static getCheckinCommand(): Command {
    return {
      command: 'auto-tfs.checkin',
      title: '$(repo-push)',
      tooltip: 'Check-In',
      arguments: [this.sourceControl],
    };
  }

  private static getShelveCommand(): Command {
    return {
      command: 'auto-tfs.shelve',
      title: '$(save)',
      tooltip: 'Shelve',
      arguments: [this.sourceControl],
    };
  }

  private static initGroup(
    name: string,
    title: string
  ): SourceControlResourceGroup {
    const group: SourceControlResourceGroup =
      this.sourceControl.createResourceGroup(name, title);

    group.resourceStates = [];

    return group;
  }

  private static updateChanges(changes: SourceControlResourceState[]): void {
    const excludedPaths: string[] | undefined =
      this.extensionContext.workspaceState.get<string[] | undefined>(
        'auto-tfs-excluded'
      );

    if (!excludedPaths?.length) {
      this.included.resourceStates = changes;

      return;
    }

    const excluded: SourceControlResourceState[] = this.filter(
      changes,
      excludedPaths
    );

    this.excluded.resourceStates = [...excluded];

    const included: SourceControlResourceState[] = this.negativefilter(
      changes,
      excludedPaths
    );

    this.included.resourceStates = [...included];
  }

  private static updateCountBadge(): void {
    const count =
      this.included.resourceStates.length + this.excluded.resourceStates.length;

    this.sourceControl.count = count;
  }

  private static processChange(
    change: SCMChange,
    changes: SourceControlResourceState[]
  ): void {
    const decoration: FileDecoration | null = this.getDecorator(change.type);

    if (!decoration) {
      return;
    }

    const uri: Uri = Uri.file(change.path);

    const title = 'View';

    const resourceState: SourceControlResourceState = {
      resourceUri: uri,
      command: {
        command: 'auto-tfs.scmview',
        title,
        arguments: [uri, change],
        tooltip: title,
      },
      decorations: decoration,
    };

    this.fileDecorators.set(change.path.toString().toLowerCase(), decoration);

    changes.push(resourceState);
  }

  private static filter(
    resources: SourceControlResourceState[],
    files: string[]
  ): SourceControlResourceState[] {
    return resources.filter((resource: SourceControlResourceState): boolean =>
      files.includes(resource.resourceUri.fsPath)
    );
  }

  private static negativefilter(
    resources: SourceControlResourceState[],
    files: string[]
  ): SourceControlResourceState[] {
    return resources.filter(
      (resource: SourceControlResourceState): boolean =>
        !files.includes(resource.resourceUri.fsPath)
    );
  }

  private static updateWorkspaceExcluded(): void {
    const excluded: string[] = this.excluded.resourceStates.map(
      (resourceState: SourceControlResourceState): string =>
        resourceState.resourceUri.fsPath
    );

    this.extensionContext.workspaceState.update('auto-tfs-excluded', excluded);
  }

  private static getDecorator(type: SCMChangeType): FileDecoration | null {
    switch (type) {
      case 'Added':
        return <FileDecoration>{
          faded: false,
          strikeThrough: false,
          tooltip: 'Added',
          color: new ThemeColor('tfsStatus.added'),
          badge: 'A',
          propagate: true,
          light: getIconUri('status-added', 'light'),
          dark: getIconUri('status-added', 'dark'),
        };

      case 'Deleted':
        return <FileDecoration>{
          faded: true,
          strikeThrough: true,
          tooltip: 'Deleted',
          color: new ThemeColor('tfsStatus.deleted'),
          badge: 'D',
          propagate: true,
          light: getIconUri('status-deleted', 'light'),
          dark: getIconUri('status-deleted', 'dark'),
        };

      case 'RenamedModified':
        return <FileDecoration>{
          faded: false,
          strikeThrough: false,
          tooltip: 'Renamed & Modified',
          color: new ThemeColor('tfsStatus.renamedModified'),
          badge: 'RM',
          propagate: true,
          light: getIconUri('status-renamed', 'light'),
          dark: getIconUri('status-renamed', 'dark'),
        };

      case 'Renamed':
        return <FileDecoration>{
          faded: false,
          strikeThrough: false,
          tooltip: 'Renamed',
          color: new ThemeColor('tfsStatus.renamed'),
          badge: 'R',
          propagate: true,
          light: getIconUri('status-renamed', 'light'),
          dark: getIconUri('status-renamed', 'dark'),
        };

      case 'Modified':
        return <FileDecoration>{
          faded: false,
          strikeThrough: false,
          tooltip: 'Modified',
          color: new ThemeColor('tfsStatus.modified'),
          badge: 'M',
          propagate: true,
          light: getIconUri('status-modified', 'light'),
          dark: getIconUri('status-modified', 'dark'),
        };

      default:
        return null;
    }
  }
}
