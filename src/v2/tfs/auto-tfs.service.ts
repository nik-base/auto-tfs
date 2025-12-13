import {
  commands,
  env,
  Range,
  SourceControl,
  SourceControlResourceGroup,
  SourceControlResourceState,
  TextDocument,
  TextDocumentShowOptions,
  TextEditor,
  Uri,
  ViewColumn,
  window,
  workspace,
  WorkspaceFolder,
} from 'vscode';
import { TFSService } from './tfs-service';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';
import { AutoTFSNotification } from '../core/autotfs-notifcation';
import { AutoTFSConfirmOption } from '../types';
import { ProcessResult, SCMChange, TFSWorkfoldInfo } from '../models';
import { TFSCommandOutputParser } from './parser/tfs-command-output-parser';
import { AutoTFSLogger } from '../core/autotfs-logger';
import { AutoTFSSCM } from '../scm/auto-tfs-scm';
import { AutoTFSStatusBar } from '../status-bar/auto-tfs-status-bar';
import { parse, ParsedPath } from 'path';

export class AutoTFSService {
  private readonly tfsService: TFSService;

  constructor(tfsService: TFSService) {
    this.tfsService = tfsService;
  }

  async checkout(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    if (files.length === 1 && (await this.isCheckedout(files[0]))) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to checkout file(s) on source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    await this.tfsService.checkout(files);

    await this.autoSync();
  }

  async add(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to add file(s) to source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    await this.tfsService.add(files);

    await this.autoSync();
  }

  async delete(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to delete file(s) from source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    await this.tfsService.delete(files);

    await this.autoSync();
  }

  async rename(
    files: ReadonlyArray<{
      readonly oldUri: Uri;
      readonly newUri: Uri;
    }>
  ): Promise<void> {
    if (!files.length) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to rename file(s) on source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    for (const file of files) {
      await this.tfsService.rename(file.oldUri, file.newUri);
    }

    await this.autoSync();
  }

  async get(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to get latest file(s) from source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    await this.tfsService.get(files);

    await this.autoSync();
  }

  async undo(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined =
      await AutoTFSNotification.warning(
        'Do you want to undo changes to the file(s)?',
        'Yes',
        'No'
      );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    await this.tfsService.undo(files);

    await this.autoSync();
  }

  async history(file: Uri): Promise<void> {
    return await this.tfsService.history(file);
  }

  async getAll(): Promise<void> {
    const root: Uri | null = this.getRootUri();

    if (!root) {
      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to get all latest file(s) from source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    AutoTFSStatusBar.startGetAll();

    AutoTFSSCM.startGetAll();

    await this.tfsService.get([root]);

    AutoTFSStatusBar.stopGetAll();

    AutoTFSSCM.stopGetAll();

    await this.autoSync();
  }

  async undoAll(): Promise<void> {
    const included: SourceControlResourceState[] = AutoTFSSCM.includedChanges;

    const excluded: SourceControlResourceState[] = AutoTFSSCM.excludedChanges;

    const allChanges: SourceControlResourceState[] = [...included, ...excluded];

    if (!allChanges?.length) {
      return;
    }

    const changes: Uri[] = allChanges.map(
      (item: SourceControlResourceState): Uri => item.resourceUri
    );

    const selectedItem: AutoTFSConfirmOption | undefined =
      await AutoTFSNotification.warning(
        'Do you want to undo changes to all the file(s)?',
        'Yes',
        'No'
      );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    await this.tfsService.undo(changes);

    await this.autoSync();
  }

  async vsDiff(file: Uri): Promise<void> {
    return await this.tfsService.diff(file);
  }

  async codeDiff(file: Uri): Promise<void> {
    const sourceFile: Uri = Uri.from({
      scheme: 'tfvc',
      path: file.fsPath,
    });

    const parsedPath: ParsedPath = parse(file.fsPath);

    await this.codeDiffServerToLocal(sourceFile, file, parsedPath, file.fsPath);
  }

  async openOnServer(file: Uri): Promise<void> {
    const result: ProcessResult | undefined =
      await this.tfsService.workfold(file);

    if (!result) {
      AutoTFSNotification.error(
        `Auto TFS: Error opening file ${file.fsPath} on server`
      );

      return;
    }

    const workfoldInfo: TFSWorkfoldInfo | null =
      TFSCommandOutputParser.getWorkfoldInfo(result.stdout);

    if (!workfoldInfo) {
      AutoTFSNotification.error(
        `Auto TFS: Error opening file ${file.fsPath} on server`
      );

      return;
    }

    const url: string = `${workfoldInfo.baseUrl}/${workfoldInfo.projectName}/_versionControl?path=${workfoldInfo.path}`;

    await env.openExternal(Uri.parse(url));
  }

  async checkin(sourceControl: SourceControl): Promise<void> {
    if (AutoTFSConfiguration.checkinMode === 'Disabled') {
      return;
    }

    const changes: Uri[] = this.getIncludedChanges();

    const comment: string | undefined = sourceControl?.inputBox?.value;

    if (!comment?.trim()) {
      AutoTFSNotification.error('Please provide a comment for this checkin');

      return;
    }

    const selectedItem: AutoTFSConfirmOption | undefined = await this.confirm(
      'Do you want to checkin file(s) on source control?'
    );

    if (!this.confirmed(selectedItem)) {
      return;
    }

    const shouldCheckinWithoutprompt: boolean =
      AutoTFSConfiguration.checkinMode === 'Without Prompt';

    await this.tfsService.checkin(changes, comment, shouldCheckinWithoutprompt);

    await this.autoSync();
  }

  async shelve(sourceControl: SourceControl): Promise<void> {
    const changes: Uri[] = this.getIncludedChanges();

    const shelveName: string | undefined = sourceControl?.inputBox?.value;

    if (!shelveName?.trim()) {
      AutoTFSNotification.error('Please provide a name for this shelve');

      return;
    }

    try {
      await this.tfsService.shelve(changes, shelveName, false);
    } catch (error: unknown) {
      if (
        !error?.toString().includes(shelveName) ||
        !error?.toString().includes('already exists')
      ) {
        return;
      }

      const selectedItem: AutoTFSConfirmOption | undefined =
        await AutoTFSNotification.warning(
          `Shelve '${shelveName}' already exists. Do you want to replace it?`,
          'Yes',
          'No'
        );

      if (!this.confirmed(selectedItem)) {
        return;
      }

      await this.tfsService.shelve(changes, shelveName, true);
    }

    await this.autoSync();
  }

  async scmOpen(file: Uri, change: SCMChange): Promise<void> {
    switch (change.type) {
      case 'Deleted':
        await this.scmDeletedDiff(file);

        return;

      case 'Added':
        await this.scmAddedDiff(file);

        return;

      case 'Renamed':
      case 'RenamedModified':
        await this.scmRenamedDiff(file);

        return;

      default:
        await this.codeDiff(file);
    }
  }

  async scmView(file: Uri, change: SCMChange): Promise<void> {
    if (change.type !== 'Deleted') {
      this.openFile(file);

      return;
    }

    const result: ProcessResult | undefined = await this.tfsService.info(file);

    if (!result) {
      AutoTFSNotification.error(`Auto TFS: Error opening file ${file.fsPath}}`);

      return;
    }

    const sourceItem: string | null = TFSCommandOutputParser.getSourceItem(
      result.stdout
    );

    if (!sourceItem) {
      AutoTFSNotification.error(`Auto TFS: Error opening file ${file.fsPath}}`);

      return;
    }

    const sourceFile: Uri = Uri.from({
      scheme: 'tfvc',
      path: file.fsPath,
    });

    await commands.executeCommand('vscode.open', sourceFile, {
      preserveFocus: false,
      preview: true,
      viewColumn: ViewColumn.Active,
    });
  }

  async sync(): Promise<void> {
    if (!workspace.workspaceFolders) {
      return;
    }

    AutoTFSStatusBar.startSync();

    AutoTFSSCM.startSync();

    const root: Uri = workspace.workspaceFolders[0].uri;

    const result: ProcessResult | undefined =
      await this.tfsService.status(root);

    if (!result) {
      AutoTFSStatusBar.stopSync();

      AutoTFSSCM.stopSync();

      return;
    }

    const changes: SCMChange[] | null = TFSCommandOutputParser.getChanges(
      result.stdout
    );

    if (!changes?.length) {
      AutoTFSStatusBar.stopSync();

      AutoTFSSCM.stopSync();

      return;
    }

    AutoTFSSCM.sync(changes);

    AutoTFSStatusBar.stopSync();

    AutoTFSSCM.stopSync();
  }

  async undoGroup(resourceGroup: SourceControlResourceGroup): Promise<void> {
    const files: Uri[] = resourceGroup.resourceStates.map(
      (item: SourceControlResourceState): Uri => item.resourceUri
    );

    await this.undo(files);

    await this.autoSync();
  }

  exclude(...resources: SourceControlResourceState[]): void {
    AutoTFSSCM.exclude(...resources);
  }

  excludeAll(): void {
    AutoTFSSCM.excludeAll();
  }

  include(...resources: SourceControlResourceState[]): void {
    AutoTFSSCM.include(...resources);
  }

  includeAll(): void {
    AutoTFSSCM.includeAll();
  }

  async autoSync(): Promise<void> {
    if (
      !AutoTFSConfiguration.tfPath ||
      !AutoTFSConfiguration.isAutoSyncEnabled
    ) {
      return;
    }

    await this.sync();
  }

  private async openFile(file: Uri): Promise<void> {
    const activeTextEditor = window.activeTextEditor;

    const opts: TextDocumentShowOptions = {
      preserveFocus: false,
      preview: true,
      viewColumn: ViewColumn.Active,
    };

    const document: TextDocument | null = await this.getEditorTextDocument(
      file,
      opts
    );

    if (!document) {
      return;
    }

    // Check if active text editor has same path as other editor. we cannot compare via
    // URI.toString() here because the schemas can be different. Instead we just go by path.
    if (activeTextEditor && activeTextEditor.document.uri.path === file.path) {
      // preserve not only selection but also visible range
      opts.selection = activeTextEditor.selection;

      const previousVisibleRanges: ReadonlyArray<Range> =
        activeTextEditor.visibleRanges;

      const editor: TextEditor = await window.showTextDocument(document, opts);

      editor.revealRange(previousVisibleRanges[0]);
    } else {
      await commands.executeCommand('vscode.open', file, opts);
    }
  }

  private async getEditorTextDocument(
    file: Uri,
    opts: TextDocumentShowOptions
  ): Promise<TextDocument | null> {
    try {
      return await workspace.openTextDocument(file);
    } catch (error: unknown) {
      await commands.executeCommand('vscode.open', file, {
        ...opts,
        override: false,
      });

      return null;
    }
  }

  private async scmAddedDiff(file: Uri): Promise<void> {
    const parsedPath: ParsedPath = parse(file.fsPath);

    const emptyFile: Uri = Uri.parse(`empty:${parsedPath.base}`);

    await this.codeDiffServerToLocal(emptyFile, file, parsedPath, file.fsPath);
  }

  private async scmDeletedDiff(file: Uri): Promise<void> {
    const parsedPath: ParsedPath = parse(file.fsPath);

    const emptyFile: Uri = Uri.parse(`empty:${parsedPath.base}`);

    const result: ProcessResult | undefined = await this.tfsService.info(file);

    if (!result) {
      AutoTFSNotification.error(
        `Auto TFS: Error opening diff for file ${file.fsPath}}`
      );

      return;
    }

    const sourceItem: string | null = TFSCommandOutputParser.getSourceItem(
      result.stdout
    );

    if (!sourceItem) {
      AutoTFSNotification.error(
        `Auto TFS: Error opening diff for file ${file.fsPath}}`
      );

      return;
    }

    const sourceFile: Uri = Uri.from({
      scheme: 'tfvc',
      path: sourceItem,
    });

    await this.codeDiffServerToLocal(
      sourceFile,
      emptyFile,
      parsedPath,
      file.fsPath
    );
  }

  private async scmRenamedDiff(file: Uri): Promise<void> {
    const parsedPath: ParsedPath = parse(file.fsPath);

    const result: ProcessResult | undefined = await this.tfsService.info(file);

    if (!result) {
      AutoTFSNotification.error(
        `Auto TFS: Error opening diff for file ${file.fsPath}}`
      );

      return;
    }

    const sourceItem: string | null = TFSCommandOutputParser.getSourceItem(
      result.stdout
    );

    if (!sourceItem) {
      AutoTFSNotification.error(
        `Auto TFS: Error opening diff for file ${file.fsPath}}`
      );

      return;
    }

    const sourceFile: Uri = Uri.from({
      scheme: 'tfvc',
      path: sourceItem,
    });

    await this.codeDiffServerToLocal(sourceFile, file, parsedPath, file.fsPath);
  }

  private async codeDiffServerToLocal(
    sourceFile: Uri,
    targetFile: Uri,
    parsedPath: ParsedPath,
    path: string
  ): Promise<void> {
    await commands
      .executeCommand(
        'vscode.diff',
        sourceFile,
        targetFile,
        `Compare: ${parsedPath.base} (Server <-> Local)`,
        {
          viewColumn: ViewColumn.Active,
          preserveFocus: false,
          preview: true,
        }
      )
      .then(undefined, (error: Error) => {
        const message: string = `Auto TFS: Error opening diff for file ${path}}`;

        AutoTFSLogger.error(message);

        AutoTFSLogger.logAny(error);

        AutoTFSNotification.error(message);
      });
  }

  private getRootUri(): Uri | null {
    const workspaceFolders: ReadonlyArray<WorkspaceFolder> | undefined =
      workspace.workspaceFolders;

    if (!workspaceFolders?.length) {
      return null;
    }

    const root = workspaceFolders[0].uri;

    return root;
  }

  private getIncludedChanges(): Uri[] {
    const files: Uri[] = AutoTFSSCM.includedChanges.map(
      (item: SourceControlResourceState): Uri => item.resourceUri
    );

    return files;
  }

  private async isCheckedout(file: Uri): Promise<boolean> {
    const info: ProcessResult | undefined = await this.tfsService.info(file);

    if (!info) {
      return false;
    }

    const changeType: string | null = TFSCommandOutputParser.getChangeType(
      info.stdout
    );

    if (!changeType) {
      return false;
    }

    if (changeType.includes('edit')) {
      AutoTFSLogger.warn(`File ${file.fsPath} already checked out`);

      return true;
    }
    if (changeType.includes('add')) {
      AutoTFSLogger.warn(`File ${file.fsPath} is newly added`);

      return true;
    }

    return false;
  }

  private confirm(message: string): Thenable<AutoTFSConfirmOption | undefined> {
    if (!AutoTFSConfiguration.shouldConfirm) {
      return Promise.resolve('Yes');
    }

    return AutoTFSNotification.warning(message, 'Yes', 'No');
  }

  private confirmed(selectedItem: AutoTFSConfirmOption | undefined): boolean {
    return selectedItem === 'Yes';
  }
}
