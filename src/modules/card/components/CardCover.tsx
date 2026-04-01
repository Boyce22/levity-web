export function CardCover({ coverUrl }: { coverUrl: string }) {
  return (
    <div className="w-full h-24 overflow-hidden" style={{ borderRadius: "14px 14px 0 0" }}>
      <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
    </div>
  );
}