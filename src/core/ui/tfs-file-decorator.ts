import { Disposable, Event, EventEmitter, FileDecoration, FileDecorationProvider, Uri, window } from 'vscode';
import { SCM } from '../scm';

export class TfsFileDecorator implements FileDecorationProvider {

    public readonly onDidChangeDecorations = new EventEmitter<Uri[]>();

    public onDidChangeFileDecorations?: Event<undefined | Uri | Uri[]> = this.onDidChangeDecorations.event;

    private disposables: Disposable[] = [];

    constructor() {
        this.disposables.push(window.registerFileDecorationProvider(this));
    }

    public provideFileDecoration(uri: Uri): FileDecoration | undefined {
        const decorator = SCM.fileDecorators.get(uri.fsPath);
        return decorator;
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}