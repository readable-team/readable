import { builder } from '@/builder';
import * as enums from '@/enums';

/**
 * * Enums
 */

for (const [name, e] of Object.entries(enums)) {
  builder.enumType(e, { name });
}
