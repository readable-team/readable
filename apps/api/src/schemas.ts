import { z } from 'zod';

const UNAVAILABLE_SLUGS = {
  EXACT: ['dashboard', 'cname'],
};

export const dataSchemas = {
  email: z
    .string({ required_error: '이메일 주소를 입력해 주세요' })
    .trim()
    .email({ message: '잘못된 이메일 주소예요' })
    .toLowerCase(),

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
      .regex(/^[\da-z][\da-z-]*[\da-z]$/, { message: '사이트 주소는 하이픈으로 시작하거나 끝날 수 없어요' })
      .refine((str) => !str.includes('--'), { message: '하이픈을 연속으로 사용할 수 없어요' })
      .refine((str) => !UNAVAILABLE_SLUGS.EXACT.includes(str), { message: '사용할 수 없는 사이트 주소에요' }),

    domain: z
      .string({ required_error: '도메인을 입력해 주세요' })
      .trim()
      .toLowerCase()
      .min(1, { message: '도메인을 입력해 주세요' }),
  },

  user: {
    name: z
      .string({ required_error: '이름을 입력해 주세요' })
      .trim()
      .min(1, { message: '이름을 입력해 주세요' })
      .max(50, { message: '이름은 50글자를 넘을 수 없어요' }),
  },

  team: {
    name: z
      .string({ required_error: '팀 이름을 입력해 주세요' })
      .trim()
      .min(1, { message: '팀 이름을 입력해 주세요' })
      .max(50, { message: '팀 이름은 50글자를 넘을 수 없어요' }),
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
    }),
  },

  team: {
    create: z.object({
      name: dataSchemas.team.name,
    }),

    inviteMember: z.object({
      email: dataSchemas.email,
    }),
  },
};
