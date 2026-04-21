export function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return new Date(date).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
  });
}

export function formatMentions(text: string) {
  return text.replace(/(^|\s)(@\w+)/g, "$1[$2](#mention)");
}