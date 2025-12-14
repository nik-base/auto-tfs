import { AutoTFSLogger } from '../../core/autotfs-logger';
import { AutoTFSNotification } from '../../core/autotfs-notifcation';
import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSAddCommand extends TFSCommandBase {
  override readonly command = 'add';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }

  override onCommandError(): void {
    const message =
      'Auto TFS: Command "add" failed. Please, save the file first and check TFS workspace settings / mappings';

    AutoTFSLogger.log(message);

    AutoTFSNotification.error(message);
  }
}
