import { PageHero } from "./PageHero";
import { SiteLayout } from "./SiteLayout";
import servicesHero from "@/assets/services-hero.jpg";

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export function PolicyPage({
  title,
  intro,
  sections,
  heroImage = servicesHero,
}: {
  title: string;
  intro?: string;
  sections: PolicySection[];
  heroImage?: string;
}) {
  return (
    <SiteLayout>
      <PageHero title={title} image={heroImage} />
      <section className="section-surface py-16 md:py-24">
        <div className="container-x">
          <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm md:p-12">
            {intro && (
              <p className="mb-8 text-base leading-relaxed text-muted-foreground">{intro}</p>
            )}
            <div className="space-y-8">
              {sections.map((s, i) => (
                <div key={i}>
                  <h2 className="mb-3 font-display text-xl font-semibold text-ink md:text-2xl">
                    {s.heading}
                  </h2>
                  {s.paragraphs?.map((p, j) => (
                    <p key={j} className="mb-3 text-base leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="ml-5 list-disc space-y-1.5 text-base text-muted-foreground">
                      {s.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
}