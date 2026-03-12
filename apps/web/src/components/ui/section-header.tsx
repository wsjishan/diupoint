import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
}

export default function SectionHeader({
  title,
  viewAllHref = '#',
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100 sm:text-2xl">
        {title}
      </h2>
      <Link
        href={viewAllHref}
        className="group flex items-center gap-1 text-sm font-semibold text-[#2F3FBF] dark:text-indigo-400 transition-all duration-200 hover:gap-2 hover:text-[#2535a8] dark:hover:text-indigo-300"
      >
        View all
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
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
