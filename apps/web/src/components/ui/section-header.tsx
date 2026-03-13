import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  icon?: string;
  viewAllHref?: string;
}

export default function SectionHeader({
  title,
  icon,
  viewAllHref = '#',
}: SectionHeaderProps) {
  return (
    <div className="mb-7 flex items-center justify-between sm:mb-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-2xl">
        {icon ? (
          <span
            aria-hidden="true"
            className="text-xl leading-none sm:text-2xl"
          >
            {icon}
          </span>
        ) : null}
        {title}
      </h2>
      <Link
        href={viewAllHref}
        className="group inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-sm font-semibold text-[#2F3FBF] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100/70 hover:text-[#2535a8] dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:border-indigo-300/40 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-200"
      >
        View all
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  );
}
