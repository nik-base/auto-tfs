import {
  ExtensionContext,
  commands,
  workspace,
  Uri,
  window,
  TextEditor,
  TextDocumentChangeEvent,
  TextDocument,
  FileWillRenameEvent,
  FileCreateEvent,
  FileDeleteEvent,
  SourceControlResourceState,
  SourceControlResourceGroup,
  SourceControl,
  StatusBarItem,
  OutputChannel,
  TextDocumentContentProvider,
} from 'vscode';
import { TFSService } from './v2/tfs/tfs-service';
import { AutoTFSOutputChannel } from './v2/core/autotfs-output-channel';
import { ProcessExecutor } from './v2/process/process-executor';
import { TFSCommandExecutor } from './v2/tfs/tfs-command-executor';
import { AutoTFSService } from './v2/tfs/auto-tfs.service';
import { AutoTFSConfiguration } from './v2/core/autotfs-configuration';
import { AutoTFSStatusBar } from './v2/status-bar/auto-tfs-status-bar';
import { AutoTFSSCM } from './v2/scm/auto-tfs-scm';
import { SCMChange, SCMContext } from './v2/models';
import { AutoTFSNotification } from './v2/core/autotfs-notifcation';
import { AutoTFSLogger } from './v2/core/autotfs-logger';
import { TFSDocumentContentProvider } from './v2/tfs/tfs-document-content-provider';

const outputChannel: OutputChannel = AutoTFSOutputChannel.init();

export async function activate(context: ExtensionContext) {
  AutoTFSOutputChannel.log('Auto TFS started');

  const syncStatus: StatusBarItem = AutoTFSStatusBar.initSync();

  const getAllStatus: StatusBarItem = AutoTFSStatusBar.initGetAll();

  const scm: SCMContext = AutoTFSSCM.init(context);

  const processExecutor: ProcessExecutor = new ProcessExecutor();

  const commandExecutor: TFSCommandExecutor = new TFSCommandExecutor(
    processExecutor
  );

  const tfsService: TFSService = new TFSService(commandExecutor);

  const autoTfs: AutoTFSService = new AutoTFSService(tfsService);

  const tfsDocumentContentProvider: TFSDocumentContentProvider =
    new TFSDocumentContentProvider(tfsService);

  const tfsContentProvider = workspace.registerTextDocumentContentProvider(
    'tfvc',
    tfsDocumentContentProvider
  );

  const emptyFileContentProvider =
    new (class implements TextDocumentContentProvider {
      provideTextDocumentContent(): string {
        return '';
      }
    })();

  const emptyFileProvider = workspace.registerTextDocumentContentProvider(
    'empty',
    emptyFileContentProvider
  );

  const checkoutCommand = commands.registerCommand(
    'auto-tfs.checkout',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.checkout(files);
    }
  );

  const undoCommand = commands.registerCommand(
    'auto-tfs.undo',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.undo(files);
    }
  );

  const addCommand = commands.registerCommand(
    'auto-tfs.add',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.add(files);
    }
  );

  const deleteCommand = commands.registerCommand(
    'auto-tfs.delete',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.delete(files);
    }
  );

  const getCommand = commands.registerCommand(
    'auto-tfs.get',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.get(files);
    }
  );

  const vsDiffCommand = commands.registerCommand(
    'auto-tfs.vsdiff',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.vsDiff(files[0]);
    }
  );

  const codeDiffCommand = commands.registerCommand(
    'auto-tfs.codediff',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files: ReadonlyArray<Uri> = getFiles(clickedFile, selectedFiles);

      await autoTfs.codeDiff(files[0]);
    }
  );

  const openOnServerCommand = commands.registerCommand(
    'auto-tfs.openonserver',
    async (item: Uri | SourceControlResourceState) => {
      if (!item) {
        return;
      }

      const uri: Uri | undefined =
        item instanceof Uri ? item : item.resourceUri;

      if (!uri) {
        return;
      }

      await autoTfs.openOnServer(uri);
    }
  );

  const historyCommand = commands.registerCommand(
    'auto-tfs.history',
    async (item: Uri | SourceControlResourceState) => {
      if (!item) {
        return;
      }

      const uri: Uri | undefined =
        item instanceof Uri ? item : item.resourceUri;

      if (!uri) {
        return;
      }

      await autoTfs.history(uri);
    }
  );

  const syncCommand = commands.registerCommand(
    'auto-tfs.sync',
    async (): Promise<void> => {
      await autoTfs.sync();
    }
  );

  const getAllCommand = commands.registerCommand(
    'auto-tfs.getall',
    async () => {
      await autoTfs.getAll();
    }
  );

  const scmOpenCommand = commands.registerCommand(
    'auto-tfs.scmview',
    async (clickedFile: Uri, change: SCMChange) => {
      if (!clickedFile) {
        return;
      }

      await autoTfs.scmView(clickedFile, change);
    }
  );

  const scmViewCommand = commands.registerCommand(
    'auto-tfs.scmopen',
    async (resourceState: SourceControlResourceState) => {
      const uri: Uri | undefined = resourceState?.resourceUri;

      const args: readonly unknown[] | undefined =
        resourceState?.command?.arguments;

      if (!uri || !args || args.length < 2) {
        return;
      }

      const change: SCMChange = args[1] as SCMChange;

      if (!change) {
        return;
      }

      await autoTfs.scmOpen(uri, change);
    }
  );

  const revertGroupCommand = commands.registerCommand(
    'auto-tfs.revertgroup',
    async (resourceGroup: SourceControlResourceGroup) => {
      await autoTfs.undoGroup(resourceGroup);
    }
  );

  const revertSelectedCommand = commands.registerCommand(
    'auto-tfs.revert',
    async (...resourceStates: SourceControlResourceState[]) => {
      if (!resourceStates.length) {
        return;
      }

      const files: Uri[] = resourceStates.map(
        (item: SourceControlResourceState): Uri => item.resourceUri
      );

      await autoTfs.undo(files);
    }
  );

  const revertAllCommand = commands.registerCommand(
    'auto-tfs.revertall',
    async () => {
      await autoTfs.undoAll();
    }
  );

  const excludeCommand = commands.registerCommand(
    'auto-tfs.exclude',
    async (...resourceStates: SourceControlResourceState[]) => {
      if (!resourceStates?.length) {
        return;
      }

      autoTfs.exclude(...resourceStates);
    }
  );

  const excludeAllCommand = commands.registerCommand(
    'auto-tfs.excludeall',
    async () => {
      autoTfs.excludeAll();
    }
  );

  const includeCommand = commands.registerCommand(
    'auto-tfs.include',
    async (...resourceStates: SourceControlResourceState[]) => {
      if (!resourceStates?.length) {
        return;
      }

      autoTfs.include(...resourceStates);
    }
  );

  const includeAllCommand = commands.registerCommand(
    'auto-tfs.includeall',
    async () => {
      autoTfs.includeAll();
    }
  );

  const shelveCommand = commands.registerCommand(
    'auto-tfs.shelve',
    async (sourceControl: SourceControl) => {
      if (!sourceControl) {
        return;
      }

      await autoTfs.shelve(sourceControl);
    }
  );

  const checkinCommand = commands.registerCommand(
    'auto-tfs.checkin',
    async (sourceControl: SourceControl) => {
      if (!sourceControl) {
        return;
      }

      if (
        !AutoTFSConfiguration.checkinMode ||
        AutoTFSConfiguration.checkinMode === 'Disabled'
      ) {
        return;
      }

      await autoTfs.checkin(sourceControl);
    }
  );

  const onChange = workspace.onDidChangeTextDocument(
    async (event: TextDocumentChangeEvent) => {
      if (AutoTFSConfiguration.autoCheckoutMode !== 'On Change') {
        return;
      }

      if (event.document.uri.scheme !== 'file') {
        return;
      }

      if (event.contentChanges.length === 0) {
        return;
      }

      await autoTfs.checkout([event.document.uri]);
    }
  );

  const onSave = workspace.onDidSaveTextDocument(
    async (document: TextDocument) => {
      if (AutoTFSConfiguration.autoCheckoutMode !== 'On Save') {
        return;
      }

      if (document.uri.scheme !== 'file') {
        return;
      }

      await autoTfs.checkout([document.uri]);
    }
  );

  const onRename = workspace.onWillRenameFiles((event: FileWillRenameEvent) => {
    if (!AutoTFSConfiguration.isAutoRenameEnabled) {
      return;
    }

    return event.waitUntil(tryRenameFiles(event));
  });

  const onCreate = workspace.onDidCreateFiles(
    async (event: FileCreateEvent) => {
      if (!AutoTFSConfiguration.isAutoAddEnabled) {
        return;
      }

      await autoTfs.add(event.files);
    }
  );

  const onDelete = workspace.onDidDeleteFiles(
    async (event: FileDeleteEvent) => {
      if (!AutoTFSConfiguration.isAutoDeleteEnabled) {
        return;
      }

      await autoTfs.delete(event.files);
    }
  );

  const tryRenameFiles = async (event: FileWillRenameEvent): Promise<void> => {
    try {
      if (!AutoTFSConfiguration.isAutoRenameEnabled) {
        return await Promise.resolve();
      }

      return await autoTfs.rename(event.files);
    } catch {
      return await Promise.resolve();
    }
  };

  const getFiles = (
    clickedFile: Uri,
    selectedFiles: Uri[]
  ): ReadonlyArray<Uri> => {
    return getSelectedFiles(clickedFile, selectedFiles);
  };

  const getSelectedFiles = (
    clickedFile: Uri,
    selectedFiles: Uri[]
  ): ReadonlyArray<Uri> => {
    const files: Uri[] = [];

    if (selectedFiles?.length) {
      files.push(...selectedFiles);
    }

    if (
      clickedFile &&
      !files
        .map((file: Uri): string => file.fsPath)
        .includes(clickedFile.fsPath)
    ) {
      files.push(clickedFile);
    }

    if (files.length) {
      return files;
    }

    const editor: TextEditor | null = getActiveEditor();

    if (!editor) {
      return [];
    }

    return [editor.document.uri];
  };

  const getActiveEditor = (): TextEditor | null => {
    if (!window.activeTextEditor) {
      const message: string = 'Auto TFS: No active document';

      AutoTFSLogger.log(message);

      AutoTFSNotification.info(message);

      return null;
    }

    return window.activeTextEditor;
  };

  await autoTfs.autoSync();

  context.subscriptions.push(
    emptyFileProvider,
    tfsContentProvider,
    checkoutCommand,
    undoCommand,
    addCommand,
    deleteCommand,
    getCommand,
    vsDiffCommand,
    codeDiffCommand,
    onChange,
    onRename,
    onSave,
    onCreate,
    onDelete,
    syncStatus,
    syncCommand,
    getAllCommand,
    getAllStatus,
    outputChannel,
    scm.sourceControl,
    scm.changes.included,
    scm.changes.excluded,
    scmOpenCommand,
    scmViewCommand,
    revertGroupCommand,
    revertSelectedCommand,
    revertAllCommand,
    openOnServerCommand,
    excludeAllCommand,
    excludeCommand,
    includeAllCommand,
    includeCommand,
    shelveCommand,
    historyCommand,
    checkinCommand
  );
}

export function deactivate() {
  AutoTFSOutputChannel.log('Auto TFS stopped');
}
