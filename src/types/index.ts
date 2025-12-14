export type AutoTFSCheckoutMode = 'Never' | 'On Save' | 'On Change';

export type AutoTFSCheckinMode = 'Disabled' | 'With Prompt' | 'Without Prompt';

export type AutoTFSLocale = 'English' | 'Spanish';

export type SCMChangeType =
  | 'Pristine'
  | 'Added'
  | 'Modified'
  | 'Deleted'
  | 'Renamed'
  | 'RenamedModified';

export type AutoTFSConfirmOption = 'Yes' | 'No';
