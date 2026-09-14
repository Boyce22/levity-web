<script lang="ts">import { page } from '$app/state';</script>
<main class="shell"><h1>{page.status}</h1><p class="error">{page.error?.message ?? 'Ocorreu um erro inesperado.'}</p><a href="/">Voltar ao início</a></main>
