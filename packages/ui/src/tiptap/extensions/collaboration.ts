/* eslint-disable unicorn/no-array-callback-reference */

import { Extension } from '@tiptap/core';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Step, Transform } from '@tiptap/pm/transform';
import { nanoid } from 'nanoid';

type Commit = {
  version: number;
  ref: string;
  steps: Step[];
};

type MappedStep = {
  step: Step;
  inverted: Step;
  origin: Transform;
};

// export function neutralizeSteps(steps: Step[]) {
//   const mapping = new Mapping(steps.map((s) => s.getMap()));
//   const invertedMapping = mapping.invert();

//   const neutralizedSteps: Step[] = [];

//   for (let i = 0, mapFrom = steps.length; i < steps.length; i++) {
//     const partialMapping = invertedMapping.slice(mapFrom--);
//     const mapped = steps[i].map(partialMapping);

//     if (!mapped) {
//       throw new Error('failed to neutralize steps');
//     }

//     neutralizedSteps.push(mapped);
//   }

//   return neutralizedSteps;
// }

const rebaseSteps = (transform: Transform, steps: MappedStep[], over: Step[]) => {
  for (const step of steps.reverse()) {
    transform.step(step.inverted);
  }

  for (const step of over) {
    transform.step(step);
  }

  const result: MappedStep[] = [];
  for (let i = 0, mapFrom = steps.length; i < steps.length; i++) {
    const mapping = transform.mapping.slice(mapFrom--);
    const mapped = steps[i].step.map(mapping);

    if (mapped && transform.maybeStep(mapped).doc) {
      // @ts-expect-error ProseMirror internal
      transform.mapping.setMirror(mapFrom, transform.steps.length - 1);

      result.push({
        step: mapped,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        inverted: mapped.invert(transform.docs.at(-1)!),
        origin: steps[i].origin,
      });
    }
  }

  return result;
};

class CollabState {
  get nextVersion() {
    return this.version + 1;
  }

  constructor(
    public version: number,
    public unconfirmedSteps: MappedStep[],
    public inflightCommit?: Commit,
  ) {}

  getCommit() {
    if (this.inflightCommit) {
      return this.inflightCommit;
    }

    if (this.unconfirmedSteps.length === 0) {
      return null;
    }

    this.inflightCommit = {
      version: this.version,
      ref: nanoid(32),
      steps: this.unconfirmedSteps.map((step) => step.step),
    };

    return this.inflightCommit;
  }
}

function getMappedSteps(transform: Transform) {
  const result = [];

  for (let i = 0; i < transform.steps.length; i++) {
    const step = transform.steps[i];
    const inverted = step.invert(transform.docs[i]);

    result.push({
      step,
      inverted,
      origin: transform,
    });
  }

  return result;
}

const collabKey = new PluginKey<CollabState>('collab');

type CollaborationOptions = {
  version: number;
  clientId: string;
};

export const Collaboration = Extension.create<CollaborationOptions>({
  addOptions() {
    return {
      version: 0,
      clientId: nanoid(),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: collabKey,

        state: {
          init: () => new CollabState(this.options.version, []),

          apply: (tr, collab) => {
            const state = tr.getMeta(collabKey);
            if (state) {
              return state;
            }

            if (tr.docChanged) {
              return new CollabState(
                collab.version,
                [...collab.unconfirmedSteps, ...getMappedSteps(tr)],
                collab.inflightCommit,
              );
            }

            return collab;
          },
        },

        historyPreserveItems: true,
      }),
    ];
  },
});

export function getCommit(state: EditorState): Commit | null {
  return collabKey.getState(state)?.getCommit() ?? null;
}

export function applyCommit(state: EditorState, commit: Commit) {
  const { tr } = state;

  const collabState = collabKey.getState(state);
  if (!collabState) {
    return tr;
  }

  const { nextVersion, unconfirmedSteps, inflightCommit } = collabState;
  if (nextVersion !== commit.version) {
    return tr;
  }

  if (commit.ref === inflightCommit?.ref) {
    const newCollabState = new CollabState(nextVersion, unconfirmedSteps.slice(commit.steps.length));
    return tr.setMeta(collabKey, newCollabState);
  } else {
    const rebasedSteps = rebaseSteps(tr, unconfirmedSteps, commit.steps);
    const newCollabState = new CollabState(nextVersion, rebasedSteps, inflightCommit);

    return tr
      .setMeta('addToHistory', false)
      .setMeta('rebased', unconfirmedSteps.length)
      .setMeta(collabKey, newCollabState);
  }
}

export function getVersion(state: EditorState) {
  return collabKey.getState(state)?.version ?? 0;
}
