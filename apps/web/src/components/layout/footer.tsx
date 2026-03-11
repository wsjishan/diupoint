import Container from '@/components/ui/container';

const MARKETPLACE_LINKS = [
  'All Listings',
  'Books & Notes',
  'Electronics',
  'Housing',
  'Furniture',
  'Room Essentials',
];

const COMPANY_LINKS = [
  'About DIUPoint',
  'Contact',
  'Terms of Service',
  'Privacy Policy',
];

const HELP_LINKS = ['Help Center', 'Safety Tips', 'Report Listing', 'FAQ'];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand */}
          <div>
            <span className="text-lg font-bold text-[#2F3FBF]">DIUPoint</span>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              A student-to-student marketplace for Daffodil International
              University.
            </p>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Marketplace
            </h3>
            <ul className="mt-4 space-y-2.5">
              {MARKETPLACE_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#2F3FBF]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#2F3FBF]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Help */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Help
            </h3>
            <ul className="mt-4 space-y-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#2F3FBF]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-400">
            © 2026 DIUPoint — Built for DIU students
          </p>
          <div className="flex items-center gap-3">
            {/* Twitter/X */}
            <a
              href="#"
              aria-label="Twitter"
              className="text-gray-400 hover:text-[#2F3FBF]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="text-gray-400 hover:text-[#2F3FBF]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
