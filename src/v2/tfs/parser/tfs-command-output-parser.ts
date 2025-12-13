import { workspace } from 'vscode';
import { AutoTFSLogger } from '../../core/autotfs-logger';
import { SCMChange, TFSWorkfoldInfo } from '../../models';
import { TFSLocaleConfiguration } from '../tfs-locale-configuration';
import { SCMChangeType } from '../../types';

export class TFSCommandOutputParser {
  static getSourceItem(data: string): string | null {
    try {
      const regex: RegExp = new RegExp(
        `[\\n\\r]*${TFSLocaleConfiguration.sourceItemRegex} *: *(.*)[\\n\\r]`,
        'i'
      );

      const match: RegExpMatchArray | null = data?.toString()?.match(regex);

      if (match && match.length >= 2) {
        return match[1];
      }

      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        AutoTFSLogger.error(error.message);
      } else {
        AutoTFSLogger.error(String(error));
      }

      return null;
    }
  }

  static getChangeType(data: string): string | null {
    try {
      const regex: RegExp = new RegExp(
        `[\\n\\r]*${TFSLocaleConfiguration.changeRegex} *: *(.*)[\\n\\r]`,
        'i'
      );

      const match: RegExpMatchArray | null = data?.toString()?.match(regex);

      if (match && match.length >= 2) {
        return match[1]?.toLocaleLowerCase();
      }

      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        AutoTFSLogger.error(error.message);
      } else {
        AutoTFSLogger.error(String(error));
      }

      return null;
    }
  }

  static getWorkfoldInfo(data: string): TFSWorkfoldInfo | null {
    const regex: RegExp = new RegExp(
      `[\\n\\r]* *${TFSLocaleConfiguration.collectionRegex}*: *(.*)[\\n\\r]* *(\\$\\/(.*?)\\/.*?):`,
      'i'
    );
    const match: RegExpMatchArray | null = data?.toString()?.match(regex);

    if (match && match?.length >= 4) {
      return { baseUrl: match[1], projectName: match[3], path: match[2] };
    }

    return null;
  }

  static getChanges(data: string): SCMChange[] | null {
    try {
      const lines: string[] = data.split('\r\n');

      const changes: SCMChange[] = [];

      const root = workspace.workspaceFolders![0].uri.fsPath;

      let previousChangeType: SCMChangeType = 'Pristine';

      for (const line of lines) {
        previousChangeType = this.processLine(
          line,
          previousChangeType,
          root,
          changes
        );
      }

      return changes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        AutoTFSLogger.error(error.message);
      } else {
        AutoTFSLogger.error(String(error));
      }

      return null;
    }
  }

  private static processLine(
    line: string,
    previousChangeType: SCMChangeType,
    root: string,
    changes: SCMChange[]
  ) {
    const changeType: SCMChangeType | null = this.tryProcessChangeLine(line);

    if (changeType != null) {
      return changeType;
    }

    this.tryProcessLocalItemLine(line, root, previousChangeType, changes);

    return previousChangeType;
  }

  private static tryProcessLocalItemLine(
    line: string,
    root: string,
    previousChangeType: SCMChangeType,
    changes: SCMChange[]
  ): void {
    const localItemRegex: RegExp = new RegExp(
      ` *${TFSLocaleConfiguration.localItemRegex} *: *(.*) *`,
      'i'
    );

    const localItemMatch: RegExpMatchArray | null = line.match(localItemRegex);

    if (!localItemMatch || localItemMatch.length < 2) {
      return;
    }

    this.processLocalItemLine(
      localItemMatch,
      root,
      previousChangeType,
      changes
    );
  }

  private static processLocalItemLine(
    localItemMatch: RegExpMatchArray,
    root: string,
    previousChangeType: SCMChangeType,
    changes: SCMChange[]
  ): void {
    if (previousChangeType === 'Pristine') {
      return;
    }

    const item: string = localItemMatch[1];

    const index: number = item
      .toLocaleLowerCase()
      .indexOf(root.toLocaleLowerCase());

    const path: string = item.substring(index);

    this.addChange(path, previousChangeType, changes);
  }

  private static addChange(
    path: string,
    previousChangeType: SCMChangeType,
    changes: SCMChange[]
  ): void {
    changes.push({ path, type: previousChangeType });
  }

  private static tryProcessChangeLine(line: string): SCMChangeType | null {
    const changeRegex: RegExp = new RegExp(
      ` *${TFSLocaleConfiguration.changeRegex} *: *(.*) *`,
      'i'
    );

    const changeMatch: RegExpMatchArray | null = line.match(changeRegex);

    if (!changeMatch || changeMatch.length < 2) {
      return null;
    }

    return this.processChangeLine(changeMatch);
  }

  private static processChangeLine(
    changeMatch: RegExpMatchArray
  ): SCMChangeType {
    const change: string = changeMatch[1].toLocaleLowerCase();

    if (change.includes(TFSLocaleConfiguration.addRegex)) {
      return 'Added';
    }

    if (change.includes(TFSLocaleConfiguration.deleteRegex)) {
      return 'Deleted';
    }

    if (
      change.includes(TFSLocaleConfiguration.renameRegex) &&
      change.includes(TFSLocaleConfiguration.editRegex)
    ) {
      return 'RenamedModified';
    }

    if (change.includes(TFSLocaleConfiguration.renameRegex)) {
      return 'Renamed';
    }

    if (change.includes(TFSLocaleConfiguration.editRegex)) {
      return 'Modified';
    }

    return 'Pristine';
  }
}
