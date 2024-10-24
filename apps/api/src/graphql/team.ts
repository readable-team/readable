import dayjs from 'dayjs';
import { and, asc, count, desc, eq, getTableColumns, ne } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { builder } from '@/builder';
import { PlanId } from '@/const';
import {
  db,
  extractTableCode,
  first,
  firstOrThrow,
  Images,
  PaymentInvoices,
  PaymentMethods,
  Plans,
  Sites,
  TeamMemberInvitations,
  TeamMembers,
  TeamPlans,
  Teams,
  Users,
} from '@/db';
import { sendEmail } from '@/email';
import TeamMemberAddedEmail from '@/email/templates/TeamMemberAdded.tsx';
import TeamMemberInvitedEmail from '@/email/templates/TeamMemberInvited.tsx';
import {
  BillingCycle,
  PaymentMethodState,
  SiteState,
  TeamMemberRole,
  TeamRestrictionType,
  TeamState,
  UserState,
} from '@/enums';
import { env } from '@/env';
import { ReadableError } from '@/errors';
import { pubsub } from '@/pubsub';
import { dataSchemas } from '@/schemas';
import { generateRandomAvatar } from '@/utils/image-generation';
import { calculatePaymentAmount, getNextBillingInfo } from '@/utils/payment';
import { assertTeamPermission, throwableToBoolean } from '@/utils/permissions';
import { assertTeamPlanRule, getTeamPlanRule } from '@/utils/plan';
import { assertTeamRestriction } from '@/utils/restrictions';
import { persistBlobAsImage } from '@/utils/user-contents';
import {
  Image,
  PaymentInvoice,
  PaymentMethod,
  Plan,
  Site,
  Team,
  TeamMember,
  TeamMemberInvitation,
  TeamPlan,
  User,
} from './objects';

/**
 * * Types
 */

Team.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),

    avatar: t.field({ type: Image, resolve: (team) => team.avatarId }),

    members: t.field({
      type: [TeamMember],
      resolve: async (team, _, ctx) => {
        const isMember = await throwableToBoolean(assertTeamPermission)({
          teamId: team.id,
          userId: ctx.session?.userId,
        });

        if (!ctx.session || !isMember) {
          return [];
        }

        return await Promise.all([
          db
            .select()
            .from(TeamMembers)
            .where(and(eq(TeamMembers.teamId, team.id), eq(TeamMembers.userId, ctx.session.userId)))
            .then(firstOrThrow),
          db
            .select()
            .from(TeamMembers)
            .where(and(eq(TeamMembers.teamId, team.id), ne(TeamMembers.userId, ctx.session.userId)))
            .orderBy(asc(TeamMembers.createdAt)),
        ]).then(([me, others]) => [me, ...others]);
      },
    }),

    meAsMember: t.field({
      type: TeamMember,
      nullable: true,
      resolve: async (team, _, ctx) => {
        if (!ctx.session) {
          return;
        }

        return await db
          .select()
          .from(TeamMembers)
          .where(and(eq(TeamMembers.teamId, team.id), eq(TeamMembers.userId, ctx.session.userId)))
          .then(first);
      },
    }),

    invitations: t.field({
      type: [TeamMemberInvitation],
      resolve: async (team, _, ctx) => {
        const isAdmin = await throwableToBoolean(assertTeamPermission)({
          teamId: team.id,
          userId: ctx.session?.userId,
          role: TeamMemberRole.ADMIN,
        });

        if (!isAdmin) {
          return [];
        }

        return await db
          .select()
          .from(TeamMemberInvitations)
          .where(eq(TeamMemberInvitations.teamId, team.id))
          .orderBy(asc(TeamMemberInvitations.createdAt));
      },
    }),

    sites: t.field({
      type: [Site],
      resolve: async (team) => {
        return await db
          .select()
          .from(Sites)
          .where(and(eq(Sites.teamId, team.id), eq(Sites.state, SiteState.ACTIVE)))
          .orderBy(asc(Sites.name));
      },
    }),

    plan: t.field({
      type: TeamPlan,
      resolve: async (team) => {
        return await db.select().from(TeamPlans).where(eq(TeamPlans.teamId, team.id)).then(firstOrThrow);
      },
    }),

    paymentMethod: t.field({
      type: PaymentMethod,
      nullable: true,
      resolve: async (team, _, ctx) => {
        await assertTeamPermission({
          teamId: team.id,
          userId: ctx.session?.userId,
          role: TeamMemberRole.ADMIN,
        });

        return await db
          .select()
          .from(PaymentMethods)
          .where(and(eq(PaymentMethods.teamId, team.id), eq(PaymentMethods.state, PaymentMethodState.ACTIVE)))
          .then(first);
      },
    }),

    paymentInvoices: t.field({
      type: [PaymentInvoice],
      resolve: async (team) => {
        return await db
          .select()
          .from(PaymentInvoices)
          .where(eq(PaymentInvoices.teamId, team.id))
          .orderBy(desc(PaymentInvoices.createdAt));
      },
    }),
  }),
});

TeamMember.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    role: t.expose('role', { type: TeamMemberRole }),

    user: t.field({ type: User, resolve: (member) => member.userId }),

    isSoleAdmin: t.field({
      type: 'Boolean',
      resolve: async (member) => {
        if (member.role !== TeamMemberRole.ADMIN) {
          return false;
        }

        return await db
          .select({ count: count(TeamMembers.id) })
          .from(TeamMembers)
          .where(and(eq(TeamMembers.teamId, member.teamId), eq(TeamMembers.role, TeamMemberRole.ADMIN)))
          .then((rows) => rows[0].count === 1);
      },
    }),
  }),
});

TeamMemberInvitation.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

TeamPlan.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    billingEmail: t.exposeString('billingEmail'),
    billingCycle: t.expose('billingCycle', { type: BillingCycle }),
    enrolledAt: t.expose('enrolledAt', { type: 'DateTime' }),

    plan: t.field({ type: Plan, resolve: (teamPlan) => teamPlan.planId }),

    amount: t.int({
      resolve: async (teamPlan) => {
        const plan = await db
          .select({ fee: Plans.fee })
          .from(Plans)
          .where(eq(Plans.id, teamPlan.planId))
          .then(firstOrThrow);

        return calculatePaymentAmount({ fee: plan.fee, billingCycle: teamPlan.billingCycle });
      },
    }),

    nextPaymentAt: t.field({
      type: 'DateTime',
      resolve: async (teamPlan) => {
        const info = await getNextBillingInfo(teamPlan.teamId);
        return info.nextPaymentAt;
      },
    }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  team: t.withAuth({ session: true }).field({
    type: Team,
    args: { teamId: t.arg.id() },
    resolve: async (_, args, ctx) => {
      await assertTeamPermission({
        teamId: args.teamId,
        userId: ctx.session.userId,
      });

      return args.teamId;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  createTeam: t.withAuth({ session: true }).fieldWithInput({
    type: Team,
    input: { name: t.input.string({ validate: { schema: dataSchemas.team.name } }) },
    resolve: async (_, { input }, ctx) => {
      return await createTeam(ctx.session.userId, input.name);
    },
  }),

  createDefaultTeam: t.withAuth({ session: true }).field({
    type: Team,
    resolve: async (_, __, ctx) => {
      const user = await db
        .select({ name: Users.name })
        .from(Users)
        .where(eq(Users.id, ctx.session.userId))
        .then(firstOrThrow);

      return await createTeam(ctx.session.userId, `${user.name}의 팀`);
    },
  }),

  updateTeam: t.withAuth({ session: true }).fieldWithInput({
    type: Team,
    input: {
      teamId: t.input.id(),
      name: t.input.string({ validate: { schema: dataSchemas.team.name } }),
      avatarId: t.input.id(),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: 'ADMIN',
      });

      await assertTeamRestriction({
        teamId: input.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const team = await db
        .update(Teams)
        .set({
          name: input.name,
          avatarId: input.avatarId,
        })
        .where(eq(Teams.id, input.teamId))
        .returning()
        .then(firstOrThrow);

      pubsub.publish('team:update', input.teamId, { scope: 'team' });

      return team;
    },
  }),

  deleteTeam: t.withAuth({ session: true }).fieldWithInput({
    type: Team,
    input: { teamId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: 'ADMIN',
      });

      await assertTeamRestriction({
        teamId: input.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const sites = await db
        .select({ id: Sites.id })
        .from(Sites)
        .where(and(eq(Sites.teamId, input.teamId), eq(Sites.state, SiteState.ACTIVE)));

      if (sites.length > 0) {
        throw new ReadableError({ code: 'team_has_sites' });
      }

      return await db
        .update(Teams)
        .set({ state: TeamState.DELETED })
        .where(eq(Teams.id, input.teamId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  inviteTeamMember: t.withAuth({ session: true }).fieldWithInput({
    type: t.builder.unionType('InviteTeamMemberResult', {
      types: [TeamMember, TeamMemberInvitation],
      resolveType: (object) => ('expiresAt' in object ? TeamMemberInvitation : TeamMember),
    }),
    input: {
      teamId: t.input.id(),
      email: t.input.string({ validate: { schema: dataSchemas.email } }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      await assertTeamRestriction({
        teamId: input.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      await assertTeamPlanRule({
        teamId: input.teamId,
        rule: 'memberLimit',
      });

      const me = await db
        .select({ name: Users.name, avatarPath: Images.path })
        .from(Users)
        .leftJoin(Images, eq(Users.avatarId, Images.id))
        .where(and(eq(Users.id, ctx.session.userId), eq(Users.state, UserState.ACTIVE)))
        .then(firstOrThrow);

      const invitedUser = await db
        .select({ id: Users.id })
        .from(Users)
        .where(and(eq(Users.email, input.email), eq(Users.state, UserState.ACTIVE)))
        .then(first);

      const team = await db
        .select({ name: Teams.name })
        .from(Teams)
        .where(eq(Teams.id, input.teamId))
        .then(firstOrThrow);

      if (invitedUser) {
        const existingMember = await db
          .select({ id: TeamMembers.id })
          .from(TeamMembers)
          .where(and(eq(TeamMembers.teamId, input.teamId), eq(TeamMembers.userId, invitedUser.id)))
          .then(first);

        if (existingMember) {
          throw new ReadableError({ code: 'team_member_exists' });
        }

        const memberRole = await getTeamPlanRule({
          teamId: input.teamId,
          rule: 'memberRole',
        });

        const member = await db
          .insert(TeamMembers)
          .values({
            teamId: input.teamId,
            userId: invitedUser.id,
            role: memberRole ? TeamMemberRole.MEMBER : TeamMemberRole.ADMIN,
          })
          .onConflictDoNothing()
          .returning()
          .then(firstOrThrow);

        await sendEmail({
          recipient: input.email,
          subject: `[Readable] ${team.name}에 추가되었어요`,
          body: TeamMemberAddedEmail({
            dashboardUrl: env.PUBLIC_DASHBOARD_URL,
            websiteUrl: env.PUBLIC_WEBSITE_URL,
            teamId: input.teamId,
            teamName: team.name,
            inviterName: me.name,
            inviterAvatarPath: me.avatarPath ? `${env.PUBLIC_USERCONTENTS_URL}/images/${me.avatarPath}` : undefined,
          }),
        });

        pubsub.publish('team:update', input.teamId, { scope: 'team' });

        return member;
      } else {
        const invitation = await db
          .insert(TeamMemberInvitations)
          .values({
            teamId: input.teamId,
            email: input.email,
            expiresAt: dayjs().add(1, 'day'),
          })
          .returning()
          .then(firstOrThrow);

        await sendEmail({
          recipient: input.email,
          subject: `[Readable] ${team.name}에 참여하세요`,
          body: TeamMemberInvitedEmail({
            dashboardUrl: env.PUBLIC_DASHBOARD_URL,
            websiteUrl: env.PUBLIC_WEBSITE_URL,
            teamName: team.name,
            email: input.email,
            inviterName: me.name,
            inviterAvatarPath: me.avatarPath ? `${env.PUBLIC_USERCONTENTS_URL}/images/${me.avatarPath}` : undefined,
          }),
        });

        pubsub.publish('team:update', input.teamId, { scope: 'team' });

        return invitation;
      }
    },
  }),

  resendInvitationEmail: t.withAuth({ session: true }).fieldWithInput({
    type: TeamMemberInvitation,
    input: { invitationId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      const invitation = await db
        .select({
          ...getTableColumns(TeamMemberInvitations),
          team: {
            id: Teams.id,
            name: Teams.name,
          },
        })
        .from(TeamMemberInvitations)
        .innerJoin(Teams, eq(TeamMemberInvitations.teamId, Teams.id))
        .where(eq(TeamMemberInvitations.id, input.invitationId))
        .then(firstOrThrow);

      await assertTeamPermission({
        teamId: invitation.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      await assertTeamRestriction({
        teamId: invitation.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      const me = await db
        .select({ name: Users.name, avatarPath: Images.path })
        .from(Users)
        .leftJoin(Images, eq(Users.avatarId, Images.id))
        .where(and(eq(Users.id, ctx.session.userId), eq(Users.state, UserState.ACTIVE)))
        .then(firstOrThrow);

      await sendEmail({
        recipient: invitation.email,
        subject: `[Readable] ${invitation.team.name}에 참여하세요`,
        body: TeamMemberInvitedEmail({
          dashboardUrl: env.PUBLIC_DASHBOARD_URL,
          websiteUrl: env.PUBLIC_WEBSITE_URL,
          teamName: invitation.team.name,
          email: invitation.email,
          inviterName: me.name,
          inviterAvatarPath: me.avatarPath ? `${env.PUBLIC_USERCONTENTS_URL}/images/${me.avatarPath}` : undefined,
        }),
      });

      return await db
        .update(TeamMemberInvitations)
        .set({ expiresAt: dayjs().add(1, 'day') })
        .where(eq(TeamMemberInvitations.id, input.invitationId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  revokeInvitation: t.withAuth({ session: true }).fieldWithInput({
    type: TeamMemberInvitation,
    input: { invitationId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      const invitation = await db
        .select({
          ...getTableColumns(TeamMemberInvitations),
          team: {
            id: Teams.id,
            name: Teams.name,
          },
        })
        .from(TeamMemberInvitations)
        .innerJoin(Teams, eq(TeamMemberInvitations.teamId, Teams.id))
        .where(eq(TeamMemberInvitations.id, input.invitationId))
        .then(firstOrThrow);

      await assertTeamPermission({
        teamId: invitation.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      await assertTeamRestriction({
        teamId: invitation.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      pubsub.publish('team:update', invitation.teamId, { scope: 'team' });

      return await db
        .delete(TeamMemberInvitations)
        .where(eq(TeamMemberInvitations.id, input.invitationId))
        .returning()
        .then(firstOrThrow);
    },
  }),

  removeTeamMember: t.withAuth({ session: true }).fieldWithInput({
    type: TeamMember,
    input: { teamId: t.input.id(), userId: t.input.id() },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: input.userId == ctx.session.userId ? TeamMemberRole.MEMBER : TeamMemberRole.ADMIN,
      });

      await assertTeamRestriction({
        teamId: input.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      return await db.transaction(async (tx) => {
        const member = await tx
          .delete(TeamMembers)
          .where(and(eq(TeamMembers.teamId, input.teamId), eq(TeamMembers.userId, input.userId)))
          .returning()
          .then(firstOrThrow);

        const adminCount = await tx
          .select({ count: count(TeamMembers.id) })
          .from(TeamMembers)
          .where(and(eq(TeamMembers.teamId, input.teamId), eq(TeamMembers.role, TeamMemberRole.ADMIN)))
          .then(first);

        if (adminCount?.count === 0) {
          throw new ReadableError({ code: 'team_needs_admin' });
        }

        pubsub.publish('team:update', input.teamId, { scope: 'team' });

        return member;
      });
    },
  }),

  updateTeamMemberRole: t.withAuth({ session: true }).fieldWithInput({
    type: TeamMember,
    input: {
      teamId: t.input.id(),
      userId: t.input.id(),
      role: t.input.field({ type: TeamMemberRole }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      await assertTeamRestriction({
        teamId: input.teamId,
        type: TeamRestrictionType.DASHBOARD_WRITE,
      });

      await assertTeamPlanRule({
        teamId: input.teamId,
        rule: 'memberRole',
      });

      return await db.transaction(async (tx) => {
        const member = await tx
          .update(TeamMembers)
          .set({ role: input.role })
          .where(and(eq(TeamMembers.teamId, input.teamId), eq(TeamMembers.userId, input.userId)))
          .returning()
          .then(firstOrThrow);

        const adminCount = await tx
          .select({ count: count(TeamMembers.id) })
          .from(TeamMembers)
          .where(and(eq(TeamMembers.teamId, input.teamId), eq(TeamMembers.role, TeamMemberRole.ADMIN)))
          .then(first);

        if (adminCount?.count === 0) {
          throw new ReadableError({ code: 'team_needs_admin' });
        }

        // NOTE: 다른 멤버들의 isSoleAdmin도 업데이트되어야 해서 team scope로.
        pubsub.publish('team:update', input.teamId, { scope: 'team' });

        return member;
      });
    },
  }),
}));

/**
 * * Subscriptions
 */

builder.subscriptionFields((t) => ({
  teamUpdateStream: t.withAuth({ session: true }).field({
    type: t.builder.unionType('TeamUpdateStreamPayload', {
      types: [Team, TeamMember],
      resolveType: (parent) => {
        const code = extractTableCode(parent.id);
        return match(code)
          .with('T', () => 'Team')
          .with('TM', () => 'TeamMember')
          .run();
      },
    }),
    args: { teamId: t.arg.id() },
    subscribe: async (_, args, ctx) => {
      await assertTeamPermission({
        teamId: args.teamId,
        userId: ctx.session.userId,
      });

      const repeater = pubsub.subscribe('team:update', args.teamId);

      ctx.req.signal.addEventListener('abort', () => {
        repeater.return();
      });

      return repeater;
    },
    resolve: async (payload, args) => {
      if (payload.scope === 'team') {
        return await db.select().from(Teams).where(eq(Teams.id, args.teamId)).then(firstOrThrow);
      } else {
        return await db.select().from(TeamMembers).where(eq(TeamMembers.userId, payload.userId)).then(firstOrThrow);
      }
    },
  }),
}));

/**
 * * Utils
 */

const createTeam = async (userId: string, teamName: string) => {
  return await db.transaction(async (tx) => {
    const avatar = await persistBlobAsImage({
      userId,
      file: await generateRandomAvatar(),
    });

    const user = await tx.select({ email: Users.email }).from(Users).where(eq(Users.id, userId)).then(firstOrThrow);
    const team = await tx.insert(Teams).values({ name: teamName, avatarId: avatar.id }).returning().then(firstOrThrow);

    await tx.insert(TeamMembers).values({
      teamId: team.id,
      userId,
      role: TeamMemberRole.ADMIN,
    });

    await tx.insert(TeamPlans).values({
      teamId: team.id,
      planId: PlanId.STARTER,
      billingCycle: BillingCycle.MONTHLY,
      billingEmail: user.email,
    });

    return team;
  });
};
