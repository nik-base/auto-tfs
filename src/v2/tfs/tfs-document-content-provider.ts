import { EventEmitter, TextDocumentContentProvider, Uri } from 'vscode';
import { TFSService } from './tfs-service';
import { ProcessResult } from '../models';
import { AutoTFSLogger } from '../core/autotfs-logger';
import { AutoTFSNotification } from '../core/autotfs-notifcation';

export class TFSDocumentContentProvider implements TextDocumentContentProvider {
  private readonly onDidChangeEmitter = new EventEmitter<Uri>();

  readonly onDidChange = this.onDidChangeEmitter.event;

  private readonly tfsService: TFSService;

  constructor(tfsService: TFSService) {
    this.tfsService = tfsService;
  }

  async provideTextDocumentContent(uri: Uri): Promise<string> {
    const result: ProcessResult | undefined = await this.tfsService.view(
      uri,
      uri.fsPath
    );

    if (!result) {
      const message: string = `Auto TFS: Cannot view file ${uri.fsPath}`;

      AutoTFSLogger.error(message);

      AutoTFSNotification.error(message);

      return '';
    }

    return result.stdout;
  }
}
