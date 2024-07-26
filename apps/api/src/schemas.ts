import { z } from 'zod';

const dataSchemas = {
  email: z
    .string({ required_error: '이메일 주소를 입력해 주세요' })
    .trim()
    .email({ message: '잘못된 이메일 주소예요' })
    .toLowerCase(),

  blob: {
    url: z.string().regex(/^\w+(?:\/\w+)*(?:\.\w+)?$/),
  },

  site: {
    name: z
      .string({ required_error: '사이트 이름을 한 글자 이상 입력해 주세요' })
      .trim()
      .min(1, { message: '사이트 이름을 한 글자 이상 입력해 주세요' })
      .max(50, { message: '사이트 이름은 50글자를 넘을 수 없어요' }),

    slug: z
      .string({ required_error: '사이트 주소를 입력해 주세요' })
      .trim()
      .toLowerCase()
      .min(4, { message: '사이트 주소는 4글자 이상이여야 해요' })
      .max(63, { message: '사이트 주소는 63글자를 넘을 수 없어요' })
      .regex(/^[\da-z-]+$/, { message: '사이트 주소는 소문자, 숫자, 하이픈만 사용할 수 있어요' })
      .regex(/^[\da-z][\da-z-]*[\da-z]$/, { message: '사이트 주소는 하이픈으로 시작하거나 끝날 수 없어요' }),
  },

  user: {
    name: z
      .string({ required_error: '이름을 입력해 주세요' })
      .trim()
      .min(1, { message: '이름을 입력해 주세요' })
      .max(60, { message: '이름은 60글자를 넘을 수 없어요' }),
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
  site: {
    create: z.object({
      name: dataSchemas.site.name,
    }),

    update: z.object({
      name: dataSchemas.site.name,
      slug: dataSchemas.site.slug,
    }),
  },

  user: {
    update: z.object({
      name: dataSchemas.user.name,
      avatarUrl: dataSchemas.blob.url,
    }),
  },

  workspace: {
    create: z.object({
      name: dataSchemas.workspace.name,
    }),

    inviteMember: z.object({
      email: dataSchemas.email,
    }),
  },
};
