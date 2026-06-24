import { type ReactNode } from "react";

export function PageHero({
  title,
  image,
  children,
}: {
  title: string;
  image: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative h-[260px] w-full overflow-hidden md:h-[340px]">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="container-x relative z-10 flex h-full items-center">
        <div>
          <h1 className="font-display text-4xl font-bold text-white md:text-6xl">{title}</h1>
          {children}
        </div>
      </div>
    </section>
  );
}