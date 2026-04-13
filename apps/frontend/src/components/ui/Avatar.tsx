'use client';

import Image from 'next/image';

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { px: 24, text: 'text-xs', ring: 'ring-1' },
  sm: { px: 32, text: 'text-sm', ring: 'ring-2' },
  md: { px: 40, text: 'text-base', ring: 'ring-2' },
  lg: { px: 80, text: 'text-2xl', ring: 'ring-2' },
  xl: { px: 120, text: 'text-4xl', ring: 'ring-4' },
};

const colors = [
  'bg-violet-600',
  'bg-indigo-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-pink-600',
];

function getColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

export default function Avatar({ name, email, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const { px, text, ring } = sizes[size];
  const initials = getInitials(name, email);
  const colorClass = getColor(name || email || '?');

  if (avatarUrl) {
    return (
      <div
        className={`relative rounded-full overflow-hidden ${ring} ring-white/20 shrink-0 ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={avatarUrl}
          alt={name || email || 'Avatar'}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`${colorClass} ${ring} ring-white/20 rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none ${text} ${className}`}
      style={{ width: px, height: px }}
      title={name || email || undefined}
    >
      {initials}
    </div>
  );
}
