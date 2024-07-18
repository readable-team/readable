<script lang="ts">
  export let data;

  $: console.log(data.user);
</script>

dashboard
<br />
{data.user}
