import { schema } from '@readable/ui/tiptap';
import { json } from '@sveltejs/kit';

export const GET = async () => {
  return json({
    topNode: schema.spec.topNode,
    nodes: schema.spec.nodes.toObject(),
    marks: schema.spec.marks.toObject(),
  });
};
