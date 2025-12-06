
import * as vscode from 'vscode';
import * as azdev from 'azure-devops-node-api';
import { ITfvcApi } from 'azure-devops-node-api/TfvcApi';

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

export async function getItemContent() {
    const config = vscode.workspace.getConfiguration('auto-tfs.poc');
    const organizationUrl = config.get<string>('organizationUrl');
    const personalAccessToken = config.get<string>('personalAccessToken');

    if (!organizationUrl || !personalAccessToken) {
        vscode.window.showErrorMessage('POC Configuration is missing. Please set "auto-tfs.poc.organizationUrl" and "auto-tfs.poc.personalAccessToken" in your settings.');
        return;
    }

    const serverPath = await vscode.window.showInputBox({
        prompt: 'Enter the server path of the file to retrieve (e.g., $/MyProject/main.cs)',
        placeHolder: '$/MyProject/main.cs'
    });

    if (!serverPath) {
        return;
    }

    try {
        const authHandler = azdev.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new azdev.WebApi(organizationUrl, authHandler);
        const tfvcApi: ITfvcApi = await connection.getTfvcApi();

        const fileStream = await tfvcApi.getItemContent(serverPath, undefined, undefined, false, undefined, undefined, undefined, true);
        const content = await streamToString(fileStream);

        const document = await vscode.workspace.openTextDocument({ content, language: 'plaintext' });
        await vscode.window.showTextDocument(document, { preview: false });

    } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to get item content: ${err.message}`);
    }
}
