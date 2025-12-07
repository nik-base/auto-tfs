import { CommandContext } from '../../models';
import { TFSCommandBase } from '../tfs-command-base';

export class TFSCheckoutCommand extends TFSCommandBase {
  readonly command = 'checkout';

  get context(): CommandContext {
    return { ...super.context, shouldNotify: true };
  }
}
