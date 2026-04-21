export function CardCover({ coverUrl }: { coverUrl: string }) {
  return (
    <div className="h-24 w-full overflow-hidden" style={{ borderRadius: "14px 14px 0 0" }}>
      <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
    </div>
  );
}