interface LandingBannerProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  titleAs?: 'h1' | 'h2';
}

export default function LandingBanner({
  title,
  subtitle,
  buttonText,
  titleAs = 'h2',
}: LandingBannerProps) {
  const HeadingTag = titleAs;

  return (
    <section className="relative overflow-hidden border-b border-gray-100 py-10 text-center dark:border-slate-800">
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/landing-banner-bg.png')",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-white/65 dark:bg-slate-950/70"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(79,70,229,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(79,70,229,0.18),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4">
        <HeadingTag className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
          {title}
        </HeadingTag>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-slate-400">
          {subtitle}
        </p>

        {buttonText ? (
          <div className="mt-6">
            <button className="inline-flex items-center justify-center rounded-lg bg-[#2F3FBF] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#2535a8] active:bg-[#1e2d96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950">
              {buttonText}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
