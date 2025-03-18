import { env, Uri } from 'vscode';
import { Configuration } from '../configuration';
import { Process } from '../process';
import { TfsLocaleConfiguration } from '../tfs-locale-configuration';


export class OpenOnServer {

    private config = new Configuration();

    private readonly tfsLocaleConfiguration = new TfsLocaleConfiguration();

    public open(uri: Uri): void {
        const tfPath = this.config.getTfPath();
        if (!uri || !tfPath) {
            return;
        }
        const url = this.getTfsUrl(uri, tfPath);
        if (!url) {
            return;
        }
        env.openExternal(Uri.parse(url));
    }

    private getTfsUrl(uri: Uri, tfPath: string): string | null {
        const process = new Process();
        const result = process.spawnSync(tfPath, ['workfold', uri.fsPath]);
        const parsedData = this.parseData(result);
        if (!parsedData?.baseUrl || !parsedData?.projectName || !parsedData?.path) {
            return null;
        }
        const url = `${parsedData.baseUrl}/${parsedData.projectName}/_versionControl?path=${parsedData.path}`;
        return url;
    }

    private parseData(data: string): { baseUrl: string | null; projectName: string | null; path: string | null } {
        const regex = new RegExp(`[\\n\\r]* *${this.tfsLocaleConfiguration.collectionRegex}*: *(.*)[\\n\\r]* *\\$\\/(.*?)\\/(.*?):`, 'i');
        const match = data?.toString()?.match(regex)!;
        if (match?.length >= 4) {
            return  { baseUrl: match[1], projectName: match[3], path: match[2] };
        }
        return  { baseUrl: null, projectName: null, path: null };
    }
}