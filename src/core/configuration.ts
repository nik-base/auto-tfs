import { workspace } from 'vscode';

export class Configuration {
    private readonly extension = 'auto-tfs';

    public getTfPath(): string | undefined {
        return workspace.getConfiguration(this.extension).get('tf.path');
    }

    public isTfConfirm(): boolean {
        return workspace.getConfiguration(this.extension).get('tf.confirm') ?? false;
    }

    public tfAutoCheckout(): string {
        return workspace.getConfiguration(this.extension).get('tf.autoCheckout') || 'Never';
    }

    public isTfAutoAdd(): boolean {
        return workspace.getConfiguration(this.extension).get('tf.autoAdd') ?? false;
    }

    public isTfAutoDelete(): boolean {
        return workspace.getConfiguration(this.extension).get('tf.autoDelete') ?? false;
    }

    public isTfAutoRename(): boolean {
        return workspace.getConfiguration(this.extension).get('tf.autoRename') ?? false;
    }

    public isDebugEnabled(): boolean {
        return workspace.getConfiguration(this.extension).get('debug') ?? false;
    }
}