import { OutputChannel } from '../../output-channel';
import { TfsLocaleConfiguration } from '../../tfs-locale-configuration';
import { ProcessHandler } from '../process-handler';
import { AbstractProcessHandler } from './abstract-process-handler';

export class InfoProcessHandler extends AbstractProcessHandler implements ProcessHandler {
    public override showMessageOnUI = false;
    public item: string | undefined;

    private readonly tfsLocaleConfiguration = new TfsLocaleConfiguration();

    public override handleStdOutData(data: string): void {
        this.data = this.getData(data);
        super.handleStdOutData(data);
    }

    public getData(data: string): string | null {
        try {
            const result = this.getChangeType(data);
            OutputChannel.log(result!);
            return result;
        } catch (e: any) {
            if (typeof e === 'string') {
                OutputChannel.log(e);
            } else if (e instanceof Error) {
                OutputChannel.log(e.message);
            }
            return null;
        }
    }

    public getItem(data: string): string | null {
        if (this.item === 'sourceitem') {
            return this.getSourceItem(data);
        }
        return this.getChangeType(data);
    }

    public getSourceItem(data: string): string | null {
        const regex = new RegExp(`[\\n\\r]*${this.tfsLocaleConfiguration.sourceItemRegex} *: *(.*)[\\n\\r]`, 'i');
        const match = data?.toString()?.match(regex)!;
        if (match?.length >= 2) {
            return match[1];
        }
        return null;
    }

    public getChangeType(data: string): string | null {
        const regex = new RegExp(`[\\n\\r]*${this.tfsLocaleConfiguration.changeRegex} *: *(.*)[\\n\\r]`, 'i');
        const match = data?.toString()?.match(regex)!;
        if (match?.length >= 2) {
            return match[1]?.toLocaleLowerCase();
        }
        return null;
    }
}