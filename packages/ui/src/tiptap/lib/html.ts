import { generateHTML } from '@tiptap/html';
import { handleHTML } from 'zeed-dom';
import type { Extensions, JSONContent } from '@tiptap/core';

export const renderHTML = (content: JSONContent, extensions: Extensions) => {
  const html = generateHTML(content, extensions);

  return handleHTML(html, (document) => {
    const nodeViews = document.querySelectorAll('node-view');
    for (const nodeView of nodeViews) {
      const contentEditable = nodeView.querySelector('node-view-content-editable');
      const hole = nodeView.querySelector('[data-node-view-content-editable]');
      if (!contentEditable || !hole) {
        continue;
      }

      hole.replaceWith(contentEditable);
    }
  });
};
