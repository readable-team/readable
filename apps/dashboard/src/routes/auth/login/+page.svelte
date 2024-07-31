<script lang="ts">
  import { SingleSignOnProvider } from '@/enums';
  import { graphql } from '$graphql';

  const generateSingleSignOnAuthorizationUrl = graphql(`
    mutation LoginPage_GenerateSingleSignOnAuthorizationUrl_Mutation(
      $input: GenerateSingleSignOnAuthorizationUrlInput!
    ) {
      generateSingleSignOnAuthorizationUrl(input: $input)
    }
  `);
</script>

<button
  type="button"
  on:click={async () => {
    const url = await generateSingleSignOnAuthorizationUrl({
      provider: SingleSignOnProvider.GOOGLE,
    });

    location.href = url;
  }}
>
  login
</button>
