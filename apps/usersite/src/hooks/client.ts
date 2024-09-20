import '@readable/lib/dayjs';

import { nanoid } from 'nanoid';

sessionStorage.getItem('readable-did') ?? sessionStorage.setItem('readable-did', nanoid());
