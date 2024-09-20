import { getContext, setContext } from 'svelte';
import type { MountedCurrentForm, Obj, SetupCurrentForm } from '@felte/core';

const formKey = Symbol();
const fieldKey = Symbol();

const contextKeys = [
  'data',
  'errors',
  'warnings',
  'touched',
  'isSubmitting',
  'isValid',
  'isValidating',
  'isDirty',
  'interacted',
] satisfies (keyof Form<Obj>)[];

type Form<T extends Obj> = SetupCurrentForm<T> | MountedCurrentForm<T>;
type FormContext = Pick<Form<Obj>, (typeof contextKeys)[number]>;

type FieldContext = {
  name: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setFormContext = (form: any) => {
  const context = Object.fromEntries(Object.entries(form).filter(([key]) => contextKeys.includes(key as never)));

  setContext(formKey, context);

  return {};
};

export const setFormField = (context: FieldContext) => {
  setContext(fieldKey, context);
};

export const getFormContext = () => {
  return {
    form: getContext<FormContext | undefined>(formKey),
    field: getContext<FieldContext | undefined>(fieldKey),
  };
};
