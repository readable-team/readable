import { builder } from '@/builder';
import { Site, WorkspaceMember } from './objects';

export class WorkspaceNotEmptyFailure extends Error {
  constructor(public remainingSiteIds: string[]) {
    super();
    this.name = 'WorkspaceNotEmptyFailure';
  }
}

builder.objectType(WorkspaceNotEmptyFailure, {
  name: 'WorkspaceNotEmptyFailure',
  fields: (t) => ({
    remainingSites: t.field({
      type: [Site],
      resolve: (failure) => failure.remainingSiteIds,
    }),
  }),
});

export class WorkspaceMemberRequiredFailure extends Error {
  constructor() {
    super();
    this.name = 'WorkspaceMemberRequiredFailure';
  }
}

builder.objectType(WorkspaceMemberRequiredFailure, {
  name: 'WorkspaceMemberRequiredFailure',
});

export class WorkspaceMemberAlreadyExistsFailure extends Error {
  constructor(public memberId: string) {
    super();
    this.name = 'WorkspaceMemberAlreadyExistsFailure';
  }
}

builder.objectType(WorkspaceMemberAlreadyExistsFailure, {
  name: 'WorkspaceMemberAlreadyExistsFailure',
  fields: (t) => ({
    member: t.field({
      type: WorkspaceMember,
      resolve: (failure) => failure.memberId,
    }),
  }),
});
