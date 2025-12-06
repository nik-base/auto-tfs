import * as fs from 'fs/promises';
import { constants } from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { ShellRunner } from '../common/ShellRunner';
import { ILocalTfvcService, TfvcStatus } from './ITfvcService';
import { Logger } from '../common/Logger';
import { parseStringPromise } from 'xml2js';

export class LocalTfvcService implements ILocalTfvcService {
    constructor(private runner: ShellRunner) {}

    async checkout(filePaths: string[]): Promise<void> {
        const readOnlyFiles = [];
        for (const filePath of filePaths) {
            if (!(await this.isWritable(filePath))) {
                readOnlyFiles.push(filePath);
            } else {
                Logger.log(`File is already writable, skipping checkout: ${filePath}`);
            }
        }

        if (readOnlyFiles.length === 0) {
            return;
        }

        await this.runner.run(['checkout', ...readOnlyFiles], readOnlyFiles[0]);
    }

    async add(filePaths: string[]): Promise<void> {
        if (filePaths.length === 0) {
            return;
        }
        await this.runner.run(['add', ...filePaths], filePaths[0]);
    }

    async delete(filePaths: string[]): Promise<void> {
        if (filePaths.length === 0) {
            return;
        }
        try {
            await this.runner.run(['delete', ...filePaths], filePaths[0]);
        } catch (e) {
            // Ignore if file is not tracked
        }
    }

    async undo(filePaths: string[]): Promise<void> {
        if (filePaths.length === 0) {
            return;
        }
        await this.runner.run(['undo', ...filePaths], filePaths[0]);
    }

    async status(workspaceRoot: string): Promise<TfvcStatus[]> {
        try {
            const xmlOutput = await this.runner.run(['status', '/format:xml'], workspaceRoot);
            const parsed = await parseStringPromise(xmlOutput);

            if (!parsed || !parsed['pending-sets'] || !parsed['pending-sets']['pending-set']) {
                return [];
            }

            const statuses: TfvcStatus[] = [];
            for (const set of parsed['pending-sets']['pending-set']) {
                for (const change of set['pending-changes'][0]['pending-change']) {
                    const changeType = change.$.chg.toLowerCase();
                    const localPath = change.$.local;

                    if (changeType.includes("edit")) {
                        statuses.push({ localPath, changeType: "edit" });
                    } else if (changeType.includes("add")) {
                        statuses.push({ localPath, changeType: "add" });
                    } else if (changeType.includes("delete")) {
                        statuses.push({ localPath, changeType: "delete" });
                    } else if (changeType.includes("rename")) {
                        statuses.push({ localPath, changeType: "rename" });
                    }
                }
            }
            return statuses;
        } catch (err) {
            Logger.error("Failed to parse tf status XML", err);
            return [];
        }
    }

    async getRepoVersion(filePath: string): Promise<vscode.Uri> {
        const tempFilePath = path.join(os.tmpdir(), `vscode-tfs-${Date.now()}-${path.basename(filePath)}`);
        await this.runner.run(['view', `/output:${tempFilePath}`, filePath], filePath);
        return vscode.Uri.file(tempFilePath);
    }

    private async isWritable(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath, constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }
}
