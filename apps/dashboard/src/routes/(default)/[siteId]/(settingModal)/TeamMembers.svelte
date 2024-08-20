<script lang="ts">
  import { flex } from '@readable/styled-system/patterns';
  import { Button, FormField, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$graphql';
  import type { TeamMembers_team } from '$graphql';

  let _team: TeamMembers_team;

  export { _team as $team };

  $: team = fragment(
    _team,
    graphql(`
      fragment TeamMembers_team on Team {
        id
        meAsMember {
          id
          role
        }

        members {
          id
          role

          user {
            id
            email
          }
        }
      }
    `),
  );

  const { form } = createMutationForm({
    mutation: graphql(`
      mutation UserSettingModal_InviteTeamMember_Mutation($input: InviteTeamMemberInput!) {
        inviteTeamMember(input: $input) {
          ... on TeamMember {
            id
          }

          ... on TeamMemberInvitation {
            id
            email
            createdAt
          }
        }
      }
    `),
    schema: z.object({
      teamId: dataSchemas.team.id,
      email: dataSchemas.email,
    }),
    onSuccess: () => {
      console.log('success');
    },
  });

  const updateTeamMemberRole = graphql(`
    mutation UserSettingModal_UpdateTeamMemberRole_Mutation($input: UpdateTeamMemberRoleInput!) {
      updateTeamMemberRole(input: $input) {
        id
        role
      }
    }
  `);

  const removeTeamMember = graphql(`
    mutation UserSettingModal_RemoveTeamMember_Mutation($input: RemoveTeamMemberInput!) {
      removeTeamMember(input: $input) {
        id
      }
    }
  `);
</script>

<form class={flex({ align: 'center', gap: '10px' })} use:form>
  <input name="teamId" type="hidden" value={$team.id} />
  <FormField name="email">
    <TextInput placeholder="이메일" />
  </FormField>

  <Button size="lg" type="submit">멤버 초대</Button>
</form>

<br />
<br />

<ul>
  {#each $team.members as member (member.id)}
    <li class={flex({ align: 'center', gap: '10px' })}>
      <div>
        <p>{member.user.email}</p>
        <p>{member.role}</p>
      </div>

      {#if $team.meAsMember?.role === 'ADMIN' && member.id !== $team.meAsMember?.id}
        <Button
          size="sm"
          variant="secondary"
          on:click={async () =>
            await updateTeamMemberRole({
              role: 'ADMIN',
              userId: member.user.id,
              teamId: $team.id,
            })}
        >
          ADMIN으로 변경
        </Button>
        <Button
          size="sm"
          variant="secondary"
          on:click={async () =>
            await updateTeamMemberRole({
              role: 'MEMBER',
              userId: member.user.id,
              teamId: $team.id,
            })}
        >
          MEMBER로 변경
        </Button>
      {/if}

      {#if $team.meAsMember?.role === 'ADMIN' || member.id === $team.meAsMember?.id}
        <Button
          size="sm"
          on:click={async () => {
            // TODO: alert, cache invalidate
            await removeTeamMember({ userId: member.user.id, teamId: $team.id });
            if (member.id === $team.meAsMember?.id) {
              await goto('/');
            }
          }}
        >
          탈퇴
        </Button>
      {/if}
    </li>
  {/each}
</ul>
