export function SectionHeader({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-10 ${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>
      )}
    </div>
  );
}