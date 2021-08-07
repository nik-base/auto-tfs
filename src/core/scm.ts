import { Command, FileDecoration, scm, SourceControl
    , SourceControlResourceGroup, SourceControlResourceState, ThemeColor, Uri } from 'vscode';
import { Configuration } from './configuration';
import { TfsFileDecorator } from './ui/tfs-file-decorator';
import { join as pathJoin, dirname as dirname } from 'path';

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

    private static tfs: SourceControl;

    private static changes: SourceControlResourceGroup;

    public static fileDecorators = new Map<string, FileDecoration>();

    public static fileDecorationProvider = new TfsFileDecorator();

    public static init(): { sourceControl: SourceControl, sourceControlGroup: SourceControlResourceGroup } {
        if (!new Configuration().getTfPath()) {
            return  { sourceControl: this.tfs, sourceControlGroup: this.changes };
        }
        this.fileDecorators.clear();
        this.tfs = scm.createSourceControl('tfs', 'TFS');
        this.changes = this.tfs.createResourceGroup('changes', 'Changes');
        this.changes.resourceStates = [];
        return  { sourceControl: this.tfs, sourceControlGroup: this.changes };
    }

    public static async sync(changeList: readonly SCMChange[]): Promise<void> {
        this.fileDecorators.clear();
        this.fileDecorationProvider.dispose();
        this.fileDecorationProvider = new TfsFileDecorator();
        const changes: SourceControlResourceState[] = [];
        for (const change of changeList) {
            SCM.processChange(change, changes);
        }
        this.changes.resourceStates = changes;
        this.fileDecorationProvider.onDidChangeDecorations.fire(changeList.map(m => Uri.file(m.path)));
    }

    private static processChange(change: SCMChange, changes: SourceControlResourceState[]): void {
        const decoration = this.getDecorator(change.type);
        if (!decoration) {
            return;
        }
        const uri = Uri.file(change.path);
        const title = (change.type === SCMChangeType.Added || change.type === SCMChangeType.Deleted) ? 'Open' : 'Compare';
        const resourceState = <SourceControlResourceState>{
            resourceUri: uri,
            command: <Command>{
                command: 'auto-tfs.scmopen',
                title: title,
                arguments: [uri, change],
                tooltip: title
            },
            decorations: decoration
        };
        this.fileDecorators.set(change.path.toString(), decoration);
        changes.push(resourceState);
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