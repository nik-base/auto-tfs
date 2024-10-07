import { Command, ExtensionContext, FileDecoration, QuickDiffProvider, scm, SourceControl
    , SourceControlResourceGroup, SourceControlResourceState, ThemeColor, Uri } from 'vscode';
import { Configuration } from './configuration';
import { TfsFileDecorator } from './ui/tfs-file-decorator';
import { join as pathJoin, dirname as dirname, parse as pathParse } from 'path';
import { StatusBar } from './ui/status-bar';
import { ViewTfsCommand } from './tfs/impl/view-tfs-command';
import { Process } from './process';
import { ViewProcessHandler } from './handler/impl/view-process-handler';

export class SCMChange {
    public path!: string;
    public type!: SCMChangeType;
}

export enum SCMChangeType {
    Pristine = 0,
    Modified = 1,
    Added = 2,
    Deleted = 3,
    Renamed = 4,
    RenamedModified = 5
}

const iconsRootPath = pathJoin(dirname(__dirname), 'resources', 'icons');

function getIconUri(iconName: string, theme: string): Uri {
    return Uri.file(pathJoin(iconsRootPath, theme, `${iconName}.svg`));
}

export class SCM {

    public static fileDecorators = new Map<string, FileDecoration>();

    public static fileDecorationProvider = new TfsFileDecorator();

    private static tfs: SourceControl;

    private static extensionContext: ExtensionContext;

    private static included: SourceControlResourceGroup;

    private static excluded: SourceControlResourceGroup;

    public static init(context: ExtensionContext):
    {
        sourceControl: SourceControl;
        changes: SourceControlResourceGroup;
        excluded: SourceControlResourceGroup;
    } {
        this.extensionContext = context;
        if (!new Configuration().getTfPath()) {
            return  { sourceControl: this.tfs, changes: this.included, excluded: this.excluded };
        }
        this.fileDecorators.clear();
        this.tfs = scm.createSourceControl('auto-tfs', 'TFS');
        this.tfs.statusBarCommands = this.getStatusBarCommands();
        if (new Configuration().isTfQuickDiff()) {
            this.tfs.quickDiffProvider = this.quickDiffProvider();
        }
        this.tfs.inputBox.placeholder = 'Check-in Comment / Shelve name';
        this.included = this.initGroup('included', 'Included');
        this.excluded = this.initGroup('excluded', 'Excluded');
        return  { sourceControl: this.tfs, changes: this.included, excluded: this.excluded };
    }

    public static startSync(): void {
        this.updateCommand(1, StatusBar.getSpinningSyncCommand.bind(StatusBar));
    }

    public static startGetAll(): void {
        this.updateCommand(0, StatusBar.getSpinningGetAllCommand.bind(StatusBar));
    }

    public static stopSync(): void {
        setTimeout(() => {
            this.updateCommand(1, StatusBar.getSyncCommand.bind(StatusBar));
        }, 700);
    }

    public static stopGetAll(): void {
        setTimeout(() => {
            this.updateCommand(0, StatusBar.getGetAllCommand.bind(StatusBar));
        }, 700);
    }

    public static updateCommand(index: number, commandFunction: () => Command): void {
        const existingCommands = this.getStatusBarCommands();
        const existingCommand = existingCommands[index];
        const command = commandFunction();
        existingCommand.command = command.command;
        existingCommand.title = command.title;
        existingCommand.tooltip = command.tooltip;
        this.tfs.statusBarCommands = existingCommands;
    }

    public static async sync(changeList: readonly SCMChange[]): Promise<void> {
        this.fileDecorators.clear();
        this.fileDecorationProvider.dispose();
        this.fileDecorationProvider = new TfsFileDecorator();
        const changes: SourceControlResourceState[] = [];
        for (const change of changeList) {
            SCM.processChange(change, changes);
        }
        this.updateChanges(changes);
        this.updateCountBadge();
        this.fileDecorationProvider.onDidChangeDecorations.fire(changeList.map(m => Uri.file(m.path)));
    }

    public static exclude(...resources: SourceControlResourceState[]): void {
        const files = resources.map(m => m.resourceUri.fsPath);
        this.excluded.resourceStates = this.excluded.resourceStates.concat(...resources);
        const included = this.negativefilter(this.included.resourceStates, files);
        this.included.resourceStates = [...included];
        this.updateCountBadge();
        this.updateWorkspaceExcluded();
    }

    public static excludeAll(): void {
        this.excluded.resourceStates = this.excluded.resourceStates.concat(...this.included.resourceStates);
        this.included.resourceStates = [];
        this.updateCountBadge();
        this.updateWorkspaceExcluded();
    }

    public static getIncludedChanges(): SourceControlResourceState[] {
        return this.included.resourceStates;
    }

    public static getExcludedChanges(): SourceControlResourceState[] {
        return this.excluded.resourceStates;
    }

    public static include(...resources: SourceControlResourceState[]): void {
        const files = resources.map(m => m.resourceUri.fsPath);
        this.included.resourceStates = this.included.resourceStates.concat(...resources);
        const excluded = this.negativefilter(this.excluded.resourceStates, files);
        this.excluded.resourceStates = [...excluded];
        this.updateCountBadge();
        this.updateWorkspaceExcluded();
    }

    public static includeAll(): void {
        this.included.resourceStates = this.included.resourceStates.concat(...this.excluded.resourceStates);
        this.excluded.resourceStates = [];
        this.updateCountBadge();
        this.updateWorkspaceExcluded();
    }

    private static quickDiffProvider(): QuickDiffProvider {
        return <QuickDiffProvider> {
            provideOriginalResource: this.getOriginalUri.bind(this)
        };
    }

    private static getOriginalUri(uri: Uri): Thenable<Uri> {
        return new Promise<Uri>((resolve, reject) => {
            if (!new Configuration().isTfQuickDiff()) {
                reject();
            }
            const parsedTemp = pathParse(uri.fsPath);
            const path = this.downloadFile([uri], { temp: parsedTemp, nodiff: true });
            if (!path) {
                reject();
            }
            const originalUri = Uri.file(path!);
            resolve(originalUri);
        });
    }

    private static downloadFile(uriList: readonly Uri[], data: any): string | null {
        const tfPath = new Configuration().getTfPath();
        if (!tfPath) {
            return null;
        }
        if (!uriList.length) {
            return null;
        }
        const command = new ViewTfsCommand();
        const process = new Process(command);
        const args = command.getCommandAndArgs(uriList, data);
        process.spawnSync(tfPath, args);
        const handler = command.getConsoleDataHandler() as ViewProcessHandler;
        return handler.tempPath;
    }

    private static getStatusBarCommands(): Command[] {
        const getAllCommand = StatusBar.getGetAllCommand();
        const syncCommand = StatusBar.getSyncCommand();
        const shelveCommand = this.getShelveCommand();
        if (new Configuration().tfCheckin() === 'Disabled') {
            return [getAllCommand, syncCommand, shelveCommand];
        }
        const checkinCommand = this.getCheckinCommand();
        return [getAllCommand, syncCommand, shelveCommand, checkinCommand];
    }

    private static getCheckinCommand(): Command {
        return <Command>{
            command: 'auto-tfs.checkin',
            title: '$(repo-push)',
            tooltip: 'Check-In',
            arguments: [this.tfs]
        };
    }

    private static getShelveCommand(): Command {
        return <Command>{
            command: 'auto-tfs.shelve',
            title: '$(save)',
            tooltip: 'Shelve',
            arguments: [this.tfs]
        };
    }

    private static initGroup(name: string, title: string): SourceControlResourceGroup {
        const group = this.tfs.createResourceGroup(name, title);
        group.resourceStates = [];
        return group;
    }

    private static updateChanges(changes: SourceControlResourceState[]): void {
        const excludedPaths = this.extensionContext.workspaceState.get<string[] | undefined>('auto-tfs-excluded');
        if (!excludedPaths?.length) {
            this.included.resourceStates = changes;
            return;
        }
        const excluded = this.filter(changes, excludedPaths);
        this.excluded.resourceStates = [...excluded];
        const included = this.negativefilter(changes, excludedPaths);
        this.included.resourceStates = [...included];
    }

    private static updateCountBadge(): void {
        const count = this.included?.resourceStates?.length + this.excluded?.resourceStates?.length;
        this.tfs.count = count ?? 0;
    }

    private static processChange(change: SCMChange, changes: SourceControlResourceState[]): void {
        const decoration = this.getDecorator(change.type);
        if (!decoration) {
            return;
        }
        const uri = Uri.file(change.path);
        const title = 'View';
        const resourceState = <SourceControlResourceState>{
            resourceUri: uri,
            command: <Command>{
                command: 'auto-tfs.scmview',
                title: title,
                arguments: [uri, change],
                tooltip: title
            },
            decorations: decoration
        };
        this.fileDecorators.set(change.path.toString().toLowerCase(), decoration);
        changes.push(resourceState);
    }

    private static filter(resources: SourceControlResourceState[], files: string[]): SourceControlResourceState[] {
        return resources.filter(f => files.includes(f.resourceUri.fsPath));
    }

    private static negativefilter(resources: SourceControlResourceState[], files: string[]): SourceControlResourceState[] {
        return resources.filter(f => !files.includes(f.resourceUri.fsPath));
    }

    private static updateWorkspaceExcluded(): void {
        const excluded = this.excluded.resourceStates.map(m => m.resourceUri.fsPath);
        this.extensionContext.workspaceState.update('auto-tfs-excluded', excluded);
    }

    private static getDecorator(type: SCMChangeType): FileDecoration | null {
        if (type === SCMChangeType.Added) {
            return <FileDecoration> {
                faded: false,
                strikeThrough: false,
                tooltip: 'Added',
                color: new ThemeColor('tfsStatus.added'),
                badge: 'A',
                propagate: true,
                light: getIconUri('status-added', 'light'),
                dark: getIconUri('status-added', 'dark')
            };
        }
        if (type === SCMChangeType.Deleted) {
            return <FileDecoration> {
                faded: true,
                strikeThrough: true,
                tooltip: 'Deleted',
                color: new ThemeColor('tfsStatus.deleted'),
                badge: 'D',
                propagate: true,
                light: getIconUri('status-deleted', 'light'),
                dark: getIconUri('status-deleted', 'dark')
            };
        }
        if (type === SCMChangeType.RenamedModified) {
            return <FileDecoration> {
                faded: false,
                strikeThrough: false,
                tooltip: 'Renamed & Modified',
                color: new ThemeColor('tfsStatus.renamedModified'),
                badge: 'RM',
                propagate: true,
                light: getIconUri('status-renamed', 'light'),
                dark: getIconUri('status-renamed', 'dark')
            };
        }
        if (type === SCMChangeType.Renamed) {
            return <FileDecoration> {
                faded: false,
                strikeThrough: false,
                tooltip: 'Renamed',
                color: new ThemeColor('tfsStatus.renamed'),
                badge: 'R',
                propagate: true,
                light: getIconUri('status-renamed', 'light'),
                dark: getIconUri('status-renamed', 'dark')
            };
        }
        if (type === SCMChangeType.Modified) {
            return <FileDecoration> {
                faded: false,
                strikeThrough: false,
                tooltip: 'Modified',
                color: new ThemeColor('tfsStatus.modified'),
                badge: 'M',
                propagate: true,
                light: getIconUri('status-modified', 'light'),
                dark: getIconUri('status-modified', 'dark')
            };
        }
        return null;
    }
}