export function CardProgress({ progress }: { progress: number }) {
  return (
    <div className="mt-3">
      <div
        className="w-full h-0.75 rounded-full overflow-hidden"
        style={{ background: "var(--app-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background:
              progress >= 80
                ? "#34d399"
                : progress >= 40
                  ? "var(--app-primary)"
                  : "#fbbf24",
          }}
        />
      </div>
      <span className="text-[10px] mt-0.5 block" style={{ color: "var(--app-text-muted)" }}>
        {progress}%
      </span>
    </div>
  );
}