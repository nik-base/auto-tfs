import { Message } from './core/ui/message';
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
} from 'vscode';
import { Configuration } from './core/configuration';
import { OutputChannel } from './core/output-channel';
import { Tfs } from './core/tfs';
import { SCM, SCMChange } from './core/scm';
import { StatusBar } from './core/ui/status-bar';
import { TFSService } from './v2/tfs/tfs-service';
import { AutoTFSOutputChannel } from './v2/core/autotfs-output-channel';

const tfs = new Tfs();
const outputChannel = OutputChannel.init();
AutoTFSOutputChannel.init();

export function activate(context: ExtensionContext) {
  OutputChannel.log('Auto TFS started');
  const syncStatus = StatusBar.initSync();
  const getAllStatus = StatusBar.initGetAll();
  const sc = SCM.init(context);

  const checkoutCommand = commands.registerCommand(
    'auto-tfs.checkout',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.checkOut(files);
    }
  );

  const undoCommand = commands.registerCommand(
    'auto-tfs.undo',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.undo(files);
    }
  );

  const addCommand = commands.registerCommand(
    'auto-tfs.add',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.add(files);
    }
  );

  const deleteCommand = commands.registerCommand(
    'auto-tfs.delete',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.delete(files);
    }
  );

  const getCommand = commands.registerCommand(
    'auto-tfs.get',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.get(files);
    }
  );

  const vsDiffCommand = commands.registerCommand(
    'auto-tfs.vsdiff',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.vsDiff(files[0]);
    }
  );

  const codeDiffCommand = commands.registerCommand(
    'auto-tfs.codediff',
    async (clickedFile: Uri, selectedFiles: Uri[]) => {
      const files = getFiles(clickedFile, selectedFiles);
      if (!files?.length) {
        return;
      }
      tfs.codeDiff(files[0]);
    }
  );

  const openOnServerCommand = commands.registerCommand(
    'auto-tfs.openonserver',
    async (item: Uri | SourceControlResourceState) => {
      if (!item) {
        return;
      }
      let uri: Uri | undefined;
      if (item instanceof Uri) {
        uri = item;
      } else {
        uri = item.resourceUri;
      }
      if (!uri) {
        return;
      }
      tfs.openOnServer(uri);
    }
  );

  const historyCommand = commands.registerCommand(
    'auto-tfs.history',
    async (item: Uri | SourceControlResourceState) => {
      if (!item) {
        return;
      }
      let uri: Uri | undefined;
      if (item instanceof Uri) {
        uri = item;
      } else {
        uri = item.resourceUri;
      }
      if (!uri) {
        return;
      }
      //await new TFSService().history(uri);
    }
  );

  const syncCommand = commands.registerCommand(
    'auto-tfs.sync',
    async (): Promise<void> => {
      await tfs.sync();
    }
  );

  const getAllCommand = commands.registerCommand(
    'auto-tfs.getall',
    async () => {
      await tfs.getAll();
    }
  );

  const scmOpenCommand = commands.registerCommand(
    'auto-tfs.scmview',
    async (clickedFile: Uri, change: SCMChange) => {
      if (!clickedFile) {
        return;
      }
      await tfs.scmView(clickedFile, change);
    }
  );

  const scmViewCommand = commands.registerCommand(
    'auto-tfs.scmopen',
    async (resourceState: SourceControlResourceState) => {
      const uri = resourceState?.resourceUri;
      const args = resourceState?.command?.arguments;
      if (!uri || !args || args.length < 2) {
        return;
      }
      const change = args[1] as SCMChange;
      if (!change) {
        return;
      }
      await tfs.scmOpen(uri, change);
    }
  );

  const revertGroupCommand = commands.registerCommand(
    'auto-tfs.revertgroup',
    async (resourceGroup: SourceControlResourceGroup) => {
      tfs.undoGroup(resourceGroup);
    }
  );

  const revertSelectedCommand = commands.registerCommand(
    'auto-tfs.revert',
    async (...resourceStates: SourceControlResourceState[]) => {
      if (!resourceStates.length) {
        return;
      }
      const uriList = resourceStates.map((m) => m.resourceUri);
      tfs.undo(uriList);
    }
  );

  const revertAllCommand = commands.registerCommand(
    'auto-tfs.revertall',
    async () => {
      tfs.undoAll();
    }
  );

  const excludeCommand = commands.registerCommand(
    'auto-tfs.exclude',
    async (...resourceStates: SourceControlResourceState[]) => {
      if (!resourceStates?.length) {
        return;
      }
      tfs.exclude(...resourceStates);
    }
  );

  const excludeAllCommand = commands.registerCommand(
    'auto-tfs.excludeall',
    async () => {
      tfs.excludeAll();
    }
  );

  const includeCommand = commands.registerCommand(
    'auto-tfs.include',
    async (...resourceStates: SourceControlResourceState[]) => {
      if (!resourceStates?.length) {
        return;
      }
      tfs.include(...resourceStates);
    }
  );

  const includeAllCommand = commands.registerCommand(
    'auto-tfs.includeall',
    async () => {
      tfs.includeAll();
    }
  );

  const shelveCommand = commands.registerCommand(
    'auto-tfs.shelve',
    async (sourceControl: SourceControl) => {
      if (!sourceControl) {
        return;
      }
      tfs.shelve(sourceControl);
    }
  );

  const checkinCommand = commands.registerCommand(
    'auto-tfs.checkin',
    async (sourceControl: SourceControl) => {
      if (!sourceControl) {
        return;
      }
      if (
        !new Configuration().tfCheckin() ||
        new Configuration().tfCheckin() === 'Disabled'
      ) {
        return;
      }
      tfs.checkin(sourceControl);
    }
  );

  const onChange = workspace.onDidChangeTextDocument(
    async (event: TextDocumentChangeEvent) => {
      const configuration = new Configuration();
      const autoCheckout = configuration.tfAutoCheckout();
      if (autoCheckout !== 'On Change') {
        return;
      }
      tfs.checkOut([event.document.uri]);
    }
  );

  const onSave = workspace.onDidSaveTextDocument(
    async (document: TextDocument) => {
      const configuration = new Configuration();
      const autoCheckout = configuration.tfAutoCheckout();
      if (autoCheckout !== 'On Save') {
        return;
      }
      tfs.checkOut([document.uri]);

      //   await new TFSService().checkout([document.uri]);
    }
  );

  const onRename = workspace.onWillRenameFiles((event: FileWillRenameEvent) => {
    return event.waitUntil(tryRenameFiles(event));
  });

  const onCreate = workspace.onDidCreateFiles(
    async (event: FileCreateEvent) => {
      const configuration = new Configuration();
      const autoAdd = configuration.isTfAutoAdd();
      if (!autoAdd) {
        return;
      }
      tfs.add(event.files);
    }
  );

  const onDelete = workspace.onDidDeleteFiles(
    async (event: FileDeleteEvent) => {
      const configuration = new Configuration();
      const autoDelete = configuration.isTfAutoDelete();
      if (!autoDelete) {
        return;
      }
      tfs.delete(event.files);
    }
  );

  const tryRenameFiles = (event: FileWillRenameEvent): Thenable<void> => {
    try {
      const configuration = new Configuration();
      const autoRename = configuration.isTfAutoRename();
      if (!autoRename) {
        return Promise.resolve();
      }
      return tfs.rename(event.files);
    } catch {
      return Promise.resolve();
    }
  };

  const getFiles = (clickedFile: Uri, selectedFiles: Uri[]): readonly Uri[] => {
    const files = getSelectedFiles(clickedFile, selectedFiles);
    return files;
  };

  const getSelectedFiles = (
    clickedFile: Uri,
    selectedFiles: Uri[]
  ): readonly Uri[] => {
    const files: Uri[] = [];
    if (selectedFiles?.length) {
      files.push(...selectedFiles);
    }
    if (
      clickedFile &&
      !files.map((m) => m.fsPath).includes(clickedFile.fsPath)
    ) {
      files.push(clickedFile);
    }
    if (files.length) {
      return files;
    }
    const editor = getActiveEditor();
    if (!editor) {
      return [];
    }
    return [editor.document.uri];
  };

  const getActiveEditor = (): TextEditor | null => {
    if (!window.activeTextEditor) {
      const message = 'No active document.';
      new Message().info(message);
      OutputChannel.log(message);
      return null;
    }
    return window.activeTextEditor;
  };

  tfs.autoSync();

  context.subscriptions.push(
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
    sc.sourceControl,
    sc.changes,
    sc.excluded,
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

// this method is called when your extension is deactivated
export function deactivate() {
  OutputChannel.log('Auto TFS stopped');
}
