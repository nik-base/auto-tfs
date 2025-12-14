import { SourceControl, SourceControlResourceGroup } from 'vscode';

export interface SCMContext {
  readonly sourceControl: SourceControl;
  readonly changes: {
    readonly included: SourceControlResourceGroup;
    readonly excluded: SourceControlResourceGroup;
  };
}
