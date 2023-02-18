import { OutputChannel } from '../../output-channel';
import { commands, TextDocument, TextDocumentShowOptions, Uri, ViewColumn, window, workspace } from 'vscode';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';
import { ParsedPath } from 'path';
import { unlink } from 'fs';

export class ViewProcessHandler extends AbstractProcessHandler implements ProcessHandler {

    public parsedTemp!: ParsedPath;
    public uri!: Uri;
    public tempPath!: string;
    public nodiff = false;

    public override handleExit(exitCode: number): void {
        if (this.parsedTemp && this.uri) {
            this.open();
        }
        super.handleExit(exitCode);
    }

    private open(): void {
        if (this.nodiff) {
            this.openFile(Uri.file(this.tempPath));
            return;
        }
        this.openDiff();
    }

    private openDiff(): void {
        commands.executeCommand('vscode.diff', Uri.file(this.tempPath), this.uri, `Compare: ${this.parsedTemp.base}`)
        .then(() => {
            unlink(this.tempPath, (err) => console.log(err));
        })
        .then(undefined, error => {
            unlink(this.tempPath, (err) => console.log(err));
            console.log(error);
            OutputChannel.log(error);
        });
    }

    public async openFile(uri: Uri): Promise<void> {
        const activeTextEditor = window.activeTextEditor;
        const opts: TextDocumentShowOptions = {
            preserveFocus: false,
            preview: false,
            viewColumn: ViewColumn.Active
        };

        const document = await this.getTextDocument(uri, opts);
        if (!document) {
            return;
        }

        // Check if active text editor has same path as other editor. we cannot compare via
        // URI.toString() here because the schemas can be different. Instead we just go by path.
        if (activeTextEditor && activeTextEditor.document.uri.path === uri.path) {
            // preserve not only selection but also visible range
            opts.selection = activeTextEditor.selection;
            const previousVisibleRanges = activeTextEditor.visibleRanges;
            const editor = await window.showTextDocument(document, opts);
            editor.revealRange(previousVisibleRanges[0]);
        } else {
            await commands.executeCommand('vscode.open', uri, opts);
        }
    }

    private async getTextDocument(uri: Uri, opts: TextDocumentShowOptions): Promise<TextDocument | null> {
        try {
            return await workspace.openTextDocument(uri);
        } catch (error) {
            await commands.executeCommand('vscode.open', uri, {
                ...opts,
                override: false
            });
            return null;
        }
    }
}