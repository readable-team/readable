<script lang="ts">
  import { css } from '@readable/styled-system/css';
  import { Button, FormField, TextInput } from '@readable/ui/components';
  import { createMutationForm } from '@readable/ui/forms';
  import { z } from 'zod';
  import { dataSchemas } from '@/schemas';
  import { graphql } from '$graphql';

  $: query = graphql(`
    query SiteSettingsThemePage_Query($siteId: ID!) {
      site(siteId: $siteId) {
        id
        name
        slug
        themeColor

        logo {
          id
        }
      }
    }
  `);

  const updateSite = graphql(`
    mutation SiteSettingsThemePage_UpdateSite_Mutation($input: UpdateSiteInput!) {
      updateSite(input: $input) {
        id
        slug
        name

        logo {
          id
        }
      }
    }
  `);

  const { form, data, setInitialValues } = createMutationForm({
    schema: z.object({
      siteId: z.string(),
      name: dataSchemas.site.name,
      slug: dataSchemas.site.slug,
      themeColor: dataSchemas.site.themeColor,
      logoId: z.string(),
    }),
    mutation: async ({ themeColor }) => {
      await updateSite({
        siteId: $query.site.id,
        name: $query.site.name,
        slug: $query.site.slug,
        themeColor,
        logoId: $query.site.logo?.id ?? '',
      });
    },
  });

  $: setInitialValues({
    siteId: $query.site.id,
    name: $query.site.name,
    slug: $query.site.slug,
    themeColor: $query.site.themeColor,
    logoId: $query.site.logo?.id ?? '',
  });
</script>

<div class={css({ paddingTop: '40px', paddingX: '34px', paddingBottom: '120px', width: 'full' })}>
  <h1 class={css({ marginBottom: '20px', textStyle: '28b' })}>테마 색상</h1>

  <form
    class={css({
      marginBottom: '8px',
      borderWidth: '1px',
      borderColor: 'border.primary',
      borderRadius: '10px',
      padding: '32px',
      width: 'full',
      maxWidth: '720px',
      backgroundColor: 'surface.primary',
    })}
    use:form
  >
    <FormField name="themeColor" label="색상">
      <TextInput
        on:input={(e) => {
          if (e.currentTarget.value[0] !== '#') {
            e.currentTarget.value = `#${e.currentTarget.value}`;
          }
        }}
      >
        <div
          slot="left-item"
          style:background={$data.themeColor}
          class={css({ borderWidth: '1px', borderColor: 'border.image', borderRadius: 'full', size: '16px' })}
        />
      </TextInput>
    </FormField>

    <Button style={css.raw({ marginTop: '8px', marginLeft: 'auto' })} size="lg" type="submit">변경</Button>
  </form>
</div>
