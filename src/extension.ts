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
  SourceControlResourceState,
  SourceControlResourceGroup,
  SourceControl,
  StatusBarItem,
  OutputChannel,
  TextDocumentContentProvider,
  EventEmitter,
  Event,
  FileWillDeleteEvent,
  ConfigurationChangeEvent,
} from 'vscode';
import { TFSService } from './tfs/tfs-service';
import { AutoTFSOutputChannel } from './core/autotfs-output-channel';
import { ProcessExecutor } from './process/process-executor';
import { TFSCommandExecutor } from './tfs/tfs-command-executor';
import { AutoTFSService } from './tfs/auto-tfs.service';
import { AutoTFSConfiguration } from './core/autotfs-configuration';
import { AutoTFSStatusBar } from './status-bar/auto-tfs-status-bar';
import { AutoTFSSCM } from './scm/auto-tfs-scm';
import { SCMChange, SCMContext } from './models';
import { AutoTFSNotification } from './core/autotfs-notification';
import { AutoTFSLogger } from './core/autotfs-logger';
import { TFSDocumentContentProvider } from './tfs/tfs-document-content-provider';
import { AutoTFSConfirmOption } from './types';

const outputChannel: OutputChannel = AutoTFSOutputChannel.init();

export const unAuthorizedEvent = new EventEmitter<void>();

export async function activate(context: ExtensionContext) {
  AutoTFSOutputChannel.log('Auto TFS started');

  let debounceTimer: NodeJS.Timeout | undefined;

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

  const onDidChangeConfiguration = workspace.onDidChangeConfiguration(
    (event: ConfigurationChangeEvent) => {
      if (event.affectsConfiguration('auto-tfs')) {
        AutoTFSConfiguration.refresh();
      }
    }
  );

  const registerTFSCommands = () => {
    const checkoutCommand = commands.registerCommand(
      'auto-tfs.checkout',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.checkout(files);
      }
    );

    const undoCommand = commands.registerCommand(
      'auto-tfs.undo',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.undo(files);
      }
    );

    const addCommand = commands.registerCommand(
      'auto-tfs.add',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.add(files);
      }
    );

    const deleteCommand = commands.registerCommand(
      'auto-tfs.delete',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.delete(files);
      }
    );

    const getCommand = commands.registerCommand(
      'auto-tfs.get',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.get(files);
      }
    );

    const vsDiffCommand = commands.registerCommand(
      'auto-tfs.vsdiff',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.vsDiff(files[0]);
      }
    );

    const codeDiffCommand = commands.registerCommand(
      'auto-tfs.codediff',
      async (clickedFile: Uri, selectedFiles: Uri[]) => {
        const files: readonly Uri[] = getSelectedFiles(
          clickedFile,
          selectedFiles
        );

        await autoTfs.codeDiff(files[0]);
      }
    );

    const openOnServerCommand = commands.registerCommand(
      'auto-tfs.openonserver',
      async (item: Uri | SourceControlResourceState | null) => {
        const uri: Uri | undefined =
          item instanceof Uri ? item : item?.resourceUri;

        if (!uri) {
          return;
        }

        await autoTfs.openOnServer(uri);
      }
    );

    const historyCommand = commands.registerCommand(
      'auto-tfs.history',
      async (item: Uri | SourceControlResourceState | null) => {
        const uri: Uri | undefined =
          item instanceof Uri ? item : item?.resourceUri;

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

    context.subscriptions.push(
      checkoutCommand,
      undoCommand,
      addCommand,
      deleteCommand,
      getCommand,
      vsDiffCommand,
      codeDiffCommand,
      syncCommand,
      getAllCommand,
      openOnServerCommand,
      historyCommand
    );
  };

  const registerTFSAutoCommands = () => {
    const onUnAuthorizedEvent: Event<void> = unAuthorizedEvent.event;

    const onUnAuthorizedEventSubscription = onUnAuthorizedEvent(async () => {
      const selection: AutoTFSConfirmOption | undefined =
        await AutoTFSNotification.warning(
          'Auto TFS: You are not logged in to TFS server. Do you want to login?',
          'Yes',
          'No'
        );

      if (selection !== 'Yes') {
        return;
      }

      AutoTFSNotification.info('Auto TFS: Starting status command to login...');

      await autoTfs.triggerLogin();
    });

    const onChange = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        if (AutoTFSConfiguration.autoCheckoutMode !== 'On Change') {
          return;
        }

        if (event.document.uri.scheme !== 'file') {
          return;
        }

        if (event.contentChanges.length === 0) {
          return;
        }

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const delay = 800;

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        debounceTimer = setTimeout(async () => {
          debounceTimer = undefined;

          await autoTfs.checkout([event.document.uri]);
        }, delay);
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

    const onRename = workspace.onWillRenameFiles(
      (event: FileWillRenameEvent) => {
        if (!AutoTFSConfiguration.isAutoRenameEnabled) {
          return;
        }

        return event.waitUntil(autoTfs.rename(event.files));
      }
    );

    const onCreate = workspace.onDidCreateFiles(
      async (event: FileCreateEvent) => {
        if (!AutoTFSConfiguration.isAutoAddEnabled) {
          return;
        }

        await autoTfs.add(event.files);
      }
    );

    const onWillDelete = workspace.onWillDeleteFiles(
      (event: FileWillDeleteEvent) => {
        if (!AutoTFSConfiguration.isAutoDeleteEnabled) {
          return;
        }

        event.waitUntil(autoTfs.delete(event.files));
      }
    );

    const onDelete = workspace.onDidDeleteFiles(async () => {
      if (!AutoTFSConfiguration.isAutoSyncEnabled) {
        return;
      }

      await autoTfs.autoSync();
    });

    return context.subscriptions.push(
      onUnAuthorizedEventSubscription,
      onChange,
      onRename,
      onSave,
      onCreate,
      onWillDelete,
      onDelete
    );
  };

  const registerSCMCommands = () => {
    const scmOpenCommand = commands.registerCommand(
      'auto-tfs.scmview',
      async (clickedFile: Uri | null, change: SCMChange) => {
        if (!clickedFile) {
          return;
        }

        await autoTfs.scmView(clickedFile, change);
      }
    );

    const scmViewCommand = commands.registerCommand(
      'auto-tfs.scmopen',
      async (resourceState: SourceControlResourceState | null) => {
        const uri: Uri | undefined = resourceState?.resourceUri;

        const args: readonly unknown[] | undefined =
          resourceState?.command?.arguments;

        if (!uri || !args || args.length < 2) {
          return;
        }

        const change: SCMChange | null = args[1] as SCMChange | null;

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
      (...resourceStates: SourceControlResourceState[]) => {
        if (!resourceStates.length) {
          return;
        }

        autoTfs.exclude(...resourceStates);
      }
    );

    const excludeAllCommand = commands.registerCommand(
      'auto-tfs.excludeall',
      () => autoTfs.excludeAll()
    );

    const includeCommand = commands.registerCommand(
      'auto-tfs.include',
      (...resourceStates: SourceControlResourceState[]) => {
        if (!resourceStates.length) {
          return;
        }

        autoTfs.include(...resourceStates);
      }
    );

    const includeAllCommand = commands.registerCommand(
      'auto-tfs.includeall',
      () => autoTfs.includeAll()
    );

    const shelveCommand = commands.registerCommand(
      'auto-tfs.shelve',
      async (sourceControl: SourceControl | null) => {
        if (!sourceControl) {
          return;
        }

        await autoTfs.shelve(sourceControl);
      }
    );

    const checkinCommand = commands.registerCommand(
      'auto-tfs.checkin',
      async (sourceControl: SourceControl | null) => {
        if (!sourceControl) {
          return;
        }

        if (AutoTFSConfiguration.checkinMode === 'Disabled') {
          return;
        }

        await autoTfs.checkin(sourceControl);
      }
    );

    context.subscriptions.push(
      scmOpenCommand,
      scmViewCommand,
      revertGroupCommand,
      revertSelectedCommand,
      revertAllCommand,
      excludeAllCommand,
      excludeCommand,
      includeAllCommand,
      includeCommand,
      shelveCommand,
      checkinCommand
    );
  };

  registerTFSCommands();

  registerTFSAutoCommands();

  registerSCMCommands();

  const getSelectedFiles = (
    clickedFile: Uri | null,
    selectedFiles: Uri[] | null
  ): readonly Uri[] => {
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
      const message = 'Auto TFS: No active document';

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
    unAuthorizedEvent,
    onDidChangeConfiguration,
    syncStatus,
    getAllStatus,
    outputChannel,
    scm.sourceControl,
    scm.changes.included,
    scm.changes.excluded
  );
}

export function deactivate() {
  AutoTFSOutputChannel.log('Auto TFS stopped');
}
