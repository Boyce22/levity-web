<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
  }

  let { size = 32, class: customClass = '' }: Props = $props();

  // Unique ID prefix to avoid SVG filter/gradient collisions
  const uid = Math.random().toString(36).slice(2, 8);
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 100 100"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="levity-logo {customClass}"
  aria-label="Levity logo"
  role="img"
>
  <defs>
    <linearGradient id="logo-grad-{uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <filter id="glow-{uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <path
    d="M30 20 C 30 20, 30 80, 30 80 L 80 80"
    stroke="url(#logo-grad-{uid})"
    stroke-width="16"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="logo-path"
  />

  <rect
    x="20"
    y="45"
    width="45"
    height="12"
    rx="6"
    fill="white"
    fill-opacity="0.15"
    class="logo-rect"
    style="transform-origin: 42px 51px; transform: rotate(-30deg);"
  />

  <circle
    cx="52"
    cy="55"
    r="6"
    fill="#10b981"
    filter="url(#glow-{uid})"
    class="logo-dot"
  />
</svg>

<style>
  .levity-logo {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }

  .logo-path {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: drawPath 1s ease-in-out forwards;
  }

  .logo-rect {
    opacity: 0;
    animation: enterRect 0.8s 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .logo-dot {
    opacity: 0;
    transform: scale(0);
    transform-origin: 52px 55px;
    animation: popDot 0.5s 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes drawPath {
    to { stroke-dashoffset: 0; }
  }

  @keyframes enterRect {
    from { opacity: 0; transform: rotate(-30deg) translateX(-15px); }
    to { opacity: 1; transform: rotate(-30deg) translateX(0); }
  }

  @keyframes popDot {
    to { opacity: 1; transform: scale(1); }
  }
</style>
