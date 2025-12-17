import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSGetCommand extends TFSCommandBase {
  override readonly command = 'get';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }
}
