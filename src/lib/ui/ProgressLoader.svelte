<script lang="ts">
  import LevityLogo from './LevityLogo.svelte';

  interface Props {
    isComplete?: boolean;
    message?: string;
  }

  let {
    isComplete = false,
    message = 'Preparing Board Content...',
  }: Props = $props();

  let progress = $state(15);

  $effect(() => {
    if (isComplete) {
      progress = 100;
      return;
    }
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.floor(Math.random() * 12) + 3, 94);
    }, 250);
    return () => clearInterval(interval);
  });
</script>

<div class="loader-overlay" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
  <div class="loader-content">
    <LevityLogo size={44} />

    <div class="progress-track">
      <div class="progress-bar" style="width: {progress}%;"></div>
    </div>

    <p class="loader-text">{message}</p>
  </div>
</div>

<style>
  .loader-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-loader);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #050507;
    animation: fadeIn var(--motion-fast) var(--ease-standard);
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .progress-track {
    width: 160px;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: var(--app-primary);
    transition: width 0.35s ease-out;
  }

  .loader-text {
    margin: 0;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--app-text-muted);
    opacity: 0.8;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
