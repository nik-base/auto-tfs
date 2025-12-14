import {
  Disposable,
  Event,
  EventEmitter,
  FileDecoration,
  FileDecorationProvider,
  Uri,
  window,
} from 'vscode';
import { AutoTFSSCM } from './auto-tfs-scm';

export class SCMFileDecorator implements FileDecorationProvider {
  readonly onDidChangeDecorations = new EventEmitter<Uri[]>();

  readonly onDidChangeFileDecorations?: Event<undefined | Uri | Uri[]> =
    this.onDidChangeDecorations.event;

  private readonly disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(window.registerFileDecorationProvider(this));
  }

  provideFileDecoration(uri: Uri): FileDecoration | undefined {
    return AutoTFSSCM.fileDecorators.get(uri.fsPath.toLowerCase());
  }

  dispose(): void {
    this.disposables.forEach((disposable: Disposable): void =>
      disposable.dispose()
    );
  }
}
