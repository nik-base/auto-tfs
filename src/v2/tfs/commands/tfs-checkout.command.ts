import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSCheckoutCommand extends TFSCommandBase {
  override readonly command = 'checkout';

  override get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }
}
