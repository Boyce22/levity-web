<script lang="ts">
  interface Props {
    coverUrl: string;
  }

  let { coverUrl }: Props = $props();
</script>

<div class="h-24 w-full overflow-hidden" style="border-radius: 14px 14px 0 0;">
  <img src={coverUrl} alt="Cover" class="h-full w-full object-cover" />
</div>
