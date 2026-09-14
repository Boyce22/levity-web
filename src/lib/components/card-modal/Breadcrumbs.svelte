<script lang="ts">
  interface Props {
    workspaceName: string;
    listName: string;
  }

  let { workspaceName, listName }: Props = $props();
</script>

<div class="text-app-text-muted mb-2 flex items-center gap-1.5 text-[10px] font-black tracking-[0.1em] uppercase opacity-60">
  <span class="hover:text-app-primary cursor-default transition-colors">
    {workspaceName}
  </span>
  <span class="opacity-30">/</span>
  <span class="hover:text-app-primary cursor-default transition-colors">
    {listName}
  </span>
</div>
