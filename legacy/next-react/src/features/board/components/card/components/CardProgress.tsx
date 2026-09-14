export function CardProgress({ progress }: { progress: number }) {
  return (
    <div className="mt-3">
      <div
        className="h-0.75 w-full overflow-hidden rounded-full"
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
      <span className="mt-0.5 block text-[10px]" style={{ color: "var(--app-text-muted)" }}>
        {progress}%
      </span>
    </div>
  );
}