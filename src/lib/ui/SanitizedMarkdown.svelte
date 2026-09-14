<script lang="ts">
  import { sanitizedMarkdown } from '$lib/utils/sanitized-html';

  interface Props { markdown: string; }
  let { markdown }: Props = $props();
</script>

<div use:sanitizedMarkdown={markdown}></div>
