import Container from '@/components/ui/container';

const INFO_LINKS = ['About Us', 'Contact', 'Terms of Service', 'FAQ'];

export default function Footer() {
  return (
    <footer className="py-10 md:py-12">
      <Container>
        {/* Main row */}
        <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
          {/* Brand */}
          <div className="max-w-xs text-left">
            <span className="text-base font-extrabold tracking-tight text-[#2F3FBF]">
              DIUPoint
            </span>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              A student-to-student marketplace for
              <br className="hidden sm:block" /> Daffodil International
              University.
            </p>
          </div>

          {/* Info links */}
          <nav
            aria-label="Footer navigation"
            className="w-full sm:w-auto"
          >
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-8">
              {INFO_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 dark:text-slate-400 underline-offset-2 transition-colors hover:text-[#2F3FBF] dark:hover:text-indigo-400 hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <p className="mt-8 border-t border-gray-200 dark:border-white/10 pt-5 text-left text-xs text-gray-400/80 sm:text-center dark:text-slate-500">
          © 2026 DIUPoint
        </p>
      </Container>
    </footer>
  );
}
