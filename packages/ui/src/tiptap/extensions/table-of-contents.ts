import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export type TableOfContentsOptions = {
  onUpdate: (headings: { level: number; text: string; scrollTop: number }[]) => void;
};

export const TableOfContents = Extension.create<TableOfContentsOptions>({
  name: 'tableOfContents',

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: new PluginKey('tableOfContents'),
      view: (view) => {
        const updateHeadings = () => {
          const headings: { level: number; text: string; scrollTop: number }[] = [];
          const { doc } = view.state;

          doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
              const dom = view.nodeDOM(pos) as HTMLElement;
              if (dom) {
                const parent = dom.offsetParent as HTMLElement;
                headings.push({
                  level: node.attrs.level,
                  text: node.textContent,
                  scrollTop: parent ? dom.offsetTop - parent.offsetTop : 0,
                });
              }
            }
          });

          this.options.onUpdate(headings);
        };

        updateHeadings();

        return {
          update: updateHeadings,
        };
      },
    });

    return [plugin];
  },
});
