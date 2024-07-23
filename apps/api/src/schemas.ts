import { z } from 'zod';

const dataSchemas = {
  user: {
    name: z
      .string({ required_error: '이름을 입력해 주세요' })
      .trim()
      .min(1, { message: '이름을 입력해 주세요' })
      .max(60, { message: '이름은 60글자를 넘을 수 없어요' }),
  },

  site: {
    name: z
      .string({ required_error: '사이트 이름을 한 글자 이상 입력해 주세요' })
      .trim()
      .min(1, { message: '사이트 이름을 한 글자 이상 입력해 주세요' })
      .max(50, { message: '사이트 이름은 50글자를 넘을 수 없어요' }),
  },

  workspace: {
    name: z
      .string({ required_error: '워크스페이스 이름을 입력해 주세요' })
      .trim()
      .min(1, { message: '워크스페이스 이름을 입력해 주세요' })
      .max(50, { message: '워크스페이스 이름은 50글자를 넘을 수 없어요' }),
  },
};

export const inputSchemas = {
  user: {
    setProfile: z.object({
      name: dataSchemas.user.name,
    }),
  },

  site: {
    create: z.object({
      name: dataSchemas.site.name,
    }),
  },

  workspace: {
    create: z.object({
      name: dataSchemas.workspace.name,
    }),
  },
};
