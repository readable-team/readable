import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const readableIcons = FileSystemIconLoader(path.join(__dirname, '../icons'));
