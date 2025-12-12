import { SCMChangeType } from '../types';

export interface SCMChange {
  readonly path: string;
  readonly type: SCMChangeType;
}
