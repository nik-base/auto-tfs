import { workspace } from 'vscode';

export class Configuration {
    private readonly extension = 'auto-tfs';

    public getTfPath(): string | undefined {
        return workspace.getConfiguration(this.extension).get('tf.path');
    }

    public isTfConfirm(): boolean {
        return workspace.getConfiguration(this.extension).get('tfs.confirm') ?? false;
    }

    public tfAutoCheckout(): string {
        return workspace.getConfiguration(this.extension).get('tfs.autoCheckout') || 'Never';
    }

    public isTfAutoAdd(): boolean {
        return workspace.getConfiguration(this.extension).get('tfs.autoAdd') ?? false;
    }

    public isTfAutoDelete(): boolean {
        return workspace.getConfiguration(this.extension).get('tfs.autoDelete') ?? false;
    }

    public isTfAutoRename(): boolean {
        return workspace.getConfiguration(this.extension).get('tfs.autoRename') ?? false;
    }

    public isDebugEnabled(): boolean {
        return workspace.getConfiguration(this.extension).get('tfs.debug') ?? false;
    }
}