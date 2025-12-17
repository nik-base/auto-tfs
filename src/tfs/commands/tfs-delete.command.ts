import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSDeleteCommand extends TFSCommandBase {
  override readonly command = 'delete';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }
}
