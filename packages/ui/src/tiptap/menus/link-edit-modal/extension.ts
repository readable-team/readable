import { Extension, posToDOMRect } from '@tiptap/core';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { addHttpScheme, isValidLinkStructure } from '../../../utils/url';
import Component from './Component.svelte';
import type { VirtualElement } from '@floating-ui/dom';
import type { Selection } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Commands<ReturnType> {
    linkEditModal: {
      showLinkEditModalForActiveSelection: () => ReturnType;
      showLinkEditModal: (options: {
        selection: Selection;
        currentLink: string | null;
        defaultLink: string;
      }) => ReturnType;
    };
  }
}

export const LinkEditModal = Extension.create({
  name: 'linkEditModal',

  addKeyboardShortcuts() {
    return {
      'Mod-k': ({ editor }) => {
        const { selection } = editor.state;
        const { from, to } = selection;

        if (from !== to) {
          editor.commands.showLinkEditModalForActiveSelection();
          return true;
        }

        return false;
      },
    };
  },

  addCommands() {
    return {
      showLinkEditModalForActiveSelection:
        () =>
        ({ editor, view }) => {
          const { selection } = view.state;
          const { from, to } = selection;

          let defaultLink = '';

          const currentLink = editor.getAttributes('link');
          if (currentLink.href) {
            defaultLink = currentLink.href;
          } else {
            const maybeLink = editor.state.doc.textBetween(from, to);
            if (isValidLinkStructure(maybeLink)) {
              defaultLink = addHttpScheme(maybeLink);
            }
          }

          editor.commands.showLinkEditModal({
            selection,
            defaultLink,
            currentLink: currentLink.href,
          });
          return true;
        },
      showLinkEditModal:
        ({ selection, defaultLink, currentLink }) =>
        ({ view }) => {
          const { from, to } = selection;

          const element: VirtualElement = {
            getBoundingClientRect: () => {
              if (selection instanceof NodeSelection) {
                const node = view.nodeDOM(selection.from) as HTMLElement;
                return node.getBoundingClientRect();
              } else {
                return posToDOMRect(view, selection.from, selection.to);
              }
            },
            getClientRects: () => {
              if (selection instanceof NodeSelection) {
                const node = view.nodeDOM(selection.from) as HTMLElement;
                return node.getClientRects();
              } else if (selection instanceof TextSelection) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return window.getSelection()!.getRangeAt(0).getClientRects();
              } else {
                return [posToDOMRect(view, selection.from, selection.to)];
              }
            },
            contextElement: view.dom,
          };

          const modalDom = document.createElement('div');
          const modalComponent = new Component({
            target: modalDom,
            props: {
              editor: this.editor,
              from,
              to,
              referenceElement: element,
              currentLink,
              defaultLink,
              onClose: () => {
                modalComponent.$destroy();
                modalDom.remove();
              },
            },
          });

          document.body.append(modalDom);

          return true;
        },
    };
  },
});
