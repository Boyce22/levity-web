<script lang="ts">
  import '../app.css';
  import ToastViewport from '$lib/ui/ToastViewport.svelte';
  let { children } = $props();
</script>
{@render children()}
<ToastViewport />
