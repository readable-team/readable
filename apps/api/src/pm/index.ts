import { Schema } from '@tiptap/pm/model';
import spec from './schema.json' with { type: 'json' };

export const schema = new Schema(spec);
