import { eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, Embeds, first, firstOrThrow } from '@/db';
import * as iframely from '@/external/iframely';
import { Embed } from './objects';

/**
 * * Types
 */

Embed.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.exposeString('type'),
    url: t.exposeString('url'),
    title: t.exposeString('title', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    thumbnailUrl: t.exposeString('thumbnailUrl', { nullable: true }),
    html: t.exposeString('html', { nullable: true }),
  }),
});

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  unfurlEmbed: t.withAuth({ session: true }).fieldWithInput({
    type: Embed,
    input: { url: t.input.string({ validate: { url: true } }) },
    resolve: async (_, { input }) => {
      const embed = await db.select().from(Embeds).where(eq(Embeds.url, input.url)).then(first);
      if (embed) {
        return embed;
      }

      const meta = await iframely.unfurl(input.url);

      return await db
        .insert(Embeds)
        .values({
          type: meta.type,
          url: input.url,
          title: meta.title,
          description: meta.description,
          thumbnailUrl: meta.thumbnailUrl,
          html: meta.html,
        })
        .returning()
        .then(firstOrThrow);
    },
  }),
}));
