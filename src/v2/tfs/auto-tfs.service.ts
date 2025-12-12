import { Uri } from 'vscode';
import { TFSService } from './tfs-service';
import { AutoTFSConfiguration } from '../core/autotfs-configuration';
import { AutoTFSNotification } from '../core/autotfs-notifcation';
import { AutoTFSConfirmOption } from '../types';
import { ProcessResult } from '../models';
import { TFSCommandOutputParser } from './parser/tfs-command-output-parser';
import { AutoTFSLogger } from '../core/autotfs-logger';

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

    return this.confirm(
      'Do you want to checkout file(s) on source control?'
    ).then(async (selectedItem: AutoTFSConfirmOption | undefined) => {
      if (this.confirmed(selectedItem)) {
        await this.tfsService.checkout(files);
      }
    });
  }

  async add(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    return this.confirm('Do you want to add file(s) to source control?').then(
      async (selectedItem: AutoTFSConfirmOption | undefined) => {
        if (this.confirmed(selectedItem)) {
          await this.tfsService.add(files);
        }
      }
    );
  }

  async delete(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    return this.confirm(
      'Do you want to delete file(s) from source control?'
    ).then(async (selectedItem: AutoTFSConfirmOption | undefined) => {
      if (this.confirmed(selectedItem)) {
        await this.tfsService.delete(files);
      }
    });
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

    return this.confirm(
      'Do you want to rename file(s) on source control?'
    ).then(async (selectedItem: AutoTFSConfirmOption | undefined) => {
      if (this.confirmed(selectedItem)) {
        for (const file of files) {
          await this.tfsService.rename(file.oldUri, file.newUri);
        }
      }
    });
  }

  async get(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    return this.confirm(
      'Do you want to get latest file(s) from source control?'
    ).then(async (selectedItem: AutoTFSConfirmOption | undefined) => {
      if (this.confirmed(selectedItem)) {
        await this.tfsService.delete(files);
      }
    });
  }

  async undo(files: ReadonlyArray<Uri>): Promise<void> {
    if (!files.length) {
      return;
    }

    return AutoTFSNotification.warning(
      'Do you want to undo changes to the file(s)?',
      'Yes',
      'No'
    ).then(async (selectedItem: AutoTFSConfirmOption | undefined) => {
      if (this.confirmed(selectedItem)) {
        await this.tfsService.undo(files);
      }
    });
  }

  async history(file: Uri): Promise<void> {
    return await this.tfsService.history(file);
  }

  async vsDiff(file: Uri): Promise<void> {
    return await this.tfsService.diff(file);
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
