import Link from 'next/link';

interface LandingBannerProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonHref?: string;
  titleAs?: 'h1' | 'h2';
}

export default function LandingBanner({
  title,
  subtitle,
  buttonText,
  buttonHref,
  titleAs = 'h2',
}: LandingBannerProps) {
  const HeadingTag = titleAs;

  const buttonClasses =
    'inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-[#3b4bd4] to-[#2F3FBF] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-[#4355db] hover:to-[#2535a8] hover:shadow-lg active:translate-y-0 active:from-[#2F3FBF] active:to-[#1e2d96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';

  const arrowIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 py-8 text-center dark:border-white/10 sm:py-10">
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

          <div className="relative w-full px-4 sm:px-6 lg:px-8">
            <HeadingTag className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-3xl lg:text-4xl">
              {title}
            </HeadingTag>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              {subtitle}
            </p>

            {buttonText ? (
              <div className="mt-6">
                {buttonHref ? (
                  <Link href={buttonHref} className={`group ${buttonClasses}`}>
                    {buttonText}
                    {arrowIcon}
                  </Link>
                ) : (
                  <button className={`group ${buttonClasses}`}>
                    {buttonText}
                    {arrowIcon}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
