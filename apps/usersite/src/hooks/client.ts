import { nanoid } from 'nanoid';

sessionStorage.getItem('readable-did') ?? sessionStorage.setItem('readable-did', nanoid());

export { handleError } from './common';
