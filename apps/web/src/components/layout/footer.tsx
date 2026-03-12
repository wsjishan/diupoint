import Container from '@/components/ui/container';

const INFO_LINKS = ['About DIUPoint', 'Contact', 'Terms of Service', 'FAQ'];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8 md:py-10">
      <Container>
        {/* Main row */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
          {/* Brand */}
          <div className="max-w-xs text-center sm:text-left">
            <span className="text-base font-bold text-[#2F3FBF]">DIUPoint</span>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
              A student-to-student marketplace for
              <br className="hidden sm:block" /> Daffodil International
              University.
            </p>
          </div>

          {/* Info links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 sm:justify-end">
              {INFO_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-[#2F3FBF]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <p className="mt-8 border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
          © 2026 DIUPoint — Built for DIU students
        </p>
      </Container>
    </footer>
  );
}
