import React from 'react';

export type LineIconName =
  | 'flask'
  | 'target'
  | 'cap'
  | 'users'
  | 'chart'
  | 'arrow'
  | 'check'
  | 'building'
  | 'globe'
  | 'moon'
  | 'sun'
  | 'menu'
  | 'home'
  | 'doc'
  | 'trophy'
  | 'book'
  | 'chat'
  | 'info'
  | 'bug'
  | 'rocket'
  | 'star'
  | 'logout'
  | 'user'
  | 'video';

interface LineIconProps {
  name: LineIconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const PATHS: Record<LineIconName, React.ReactNode> = {
  flask: (
    <>
      <path d="M9 2h6M10 2v6.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8.5V2" />
      <path d="M7.5 14h9" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </>
  ),
  cap: (
    <>
      <path d="M2 8l10-4 10 4-10 4-10-4z" strokeLinejoin="round" />
      <path d="M6 10.5v4c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4" />
      <path d="M21 9v5" strokeLinecap="round" />
    </>
  ),
  users: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.4" />
      <path d="M2.5 19c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
      <path d="M14.5 14.3c2.4.4 4 2 4 4.7" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M11 20V4M18 20v-7" strokeLinecap="round" />
      <path d="M2.5 20h19" strokeLinecap="round" />
    </>
  ),
  arrow: (
    <path
      d="M5 12h14M13 6l6 6-6 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  check: (
    <path d="M4 12.5l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  building: (
    <>
      <rect x="4" y="3" width="10" height="18" rx="1" />
      <path d="M14 9h6v12h-6" />
      <path
        d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1"
        strokeLinecap="round"
      />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-6-3.8-9s1.3-6.5 3.8-9z" />
    </>
  ),
  moon: (
    <path
      d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"
      strokeLinejoin="round"
    />
  ),
  sun: (
    <path
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      strokeLinecap="round"
    />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />,
  home: (
    <>
      <path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 9.5V20h5v-6h2v6h5V9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  doc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" strokeLinejoin="round" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 7 9" />
      <path d="M17 5h2.5A2.5 2.5 0 0 1 17 9" />
      <path d="M12 13v3M9 20h6M10 17h4v3h-4z" strokeLinejoin="round" />
    </>
  ),
  book: (
    <>
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13z"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13z"
        strokeLinejoin="round"
      />
    </>
  ),
  chat: (
    <path
      d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9z"
      strokeLinejoin="round"
    />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  bug: (
    <>
      <ellipse cx="12" cy="13.5" rx="5" ry="6" />
      <path
        d="M12 7.5V4M9.5 5.5l-2-2M14.5 5.5l2-2M4 12h3M17 12h3M6 17.5l-2 2M18 17.5l2 2M9.5 20l-1 2M14.5 20l1 2"
        strokeLinecap="round"
      />
    </>
  ),
  rocket: (
    <>
      <path
        d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" />
      <path d="M8 16l-3 3M16 16l3 3M9.5 20h5" strokeLinecap="round" />
    </>
  ),
  star: (
    <path
      d="M12 3l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.3 9.2l6.1-.6L12 3z"
      strokeLinejoin="round"
    />
  ),
  logout: (
    <>
      <path
        d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"
        strokeLinecap="round"
      />
      <path
        d="M16 16l4-4-4-4M20 12H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path
        d="M4.5 20c0-3.6 3.4-6.2 7.5-6.2s7.5 2.6 7.5 6.2"
        strokeLinecap="round"
      />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="6" width="14" height="12" rx="1.8" />
      <path d="M16.5 10.5l5-3v9l-5-3" strokeLinejoin="round" />
    </>
  ),
};

export default function LineIcon({
  name,
  size = 16,
  className,
  strokeWidth = 1.6,
}: LineIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
