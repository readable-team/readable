import dayjs from 'dayjs';
import { and, eq, gt, isNull, lte, or } from 'drizzle-orm';
import { Categories, db, first, firstOrThrow, Pages, Sites, TeamRestrictions } from '@/db';
import { TeamRestrictionType } from '@/enums';
import { ReadableError } from '@/errors';

type AssertTeamRestrictionParams = {
  teamId?: string;
  siteId?: string;
  categoryId?: string;
  pageId?: string;
  type: TeamRestrictionType;
};

export const assertTeamRestriction = async ({
  teamId,
  siteId,
  categoryId,
  pageId,
  type,
}: AssertTeamRestrictionParams) => {
  if (pageId) {
    const page = await db.select({ siteId: Pages.siteId }).from(Pages).where(eq(Pages.id, pageId)).then(firstOrThrow);
    siteId = page.siteId;
  }

  if (categoryId) {
    const category = await db
      .select({ siteId: Categories.siteId })
      .from(Categories)
      .where(eq(Categories.id, categoryId))
      .then(firstOrThrow);
    siteId = category.siteId;
  }

  if (siteId) {
    const site = await db.select({ teamId: Sites.teamId }).from(Sites).where(eq(Sites.id, siteId)).then(firstOrThrow);
    teamId = site.teamId;
  }

  if (!teamId) {
    throw new ReadableError({ code: 'forbidden' });
  }

  const now = dayjs();

  const restriction = await db
    .select({ id: TeamRestrictions.id })
    .from(TeamRestrictions)
    .where(
      and(
        eq(TeamRestrictions.teamId, teamId),
        eq(TeamRestrictions.type, type),
        lte(TeamRestrictions.effectiveAt, now),
        or(gt(TeamRestrictions.expiresAt, now), isNull(TeamRestrictions.expiresAt)),
      ),
    )
    .then(first);

  if (restriction) {
    throw new ReadableError({ code: 'forbidden' });
  }
};
