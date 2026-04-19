'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Member {
  slug: string;
  name: string;
  role: string;
  github?: string;
  avatar?: string;
  joined?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// Deterministic color from name so it stays stable across renders
const COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
  'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500',
];
function colorFor(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

function MemberCard({ member, isDarkMode }: { member: Member; isDarkMode: boolean }) {
  const [imgError, setImgError] = useState(false);
  const showAvatar = member.avatar && !imgError;

  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="relative">
        {showAvatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            onError={() => setImgError(true)}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-400/50"
          />
        ) : (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-indigo-400/50 ${colorFor(member.name)}`}>
            {getInitials(member.name)}
          </div>
        )}
      </div>
      <div className="text-center min-w-0 w-full">
        <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          {member.name}
        </p>
        {member.role && (
          <p className={`text-xs truncate mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {member.role}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MembersGrid() {
  const { isDarkMode } = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/community/members')
      .then(r => r.json())
      .then(data => setMembers(data.members ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!members.length) return null;

  return (
    <div className={`rounded-lg p-8 shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        👥 Integrantes de la Comunidad
      </h2>
      <p className={`text-center text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {members.length} {members.length === 1 ? 'miembro' : 'miembros'} registrados
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {members.map(m => (
          <MemberCard key={m.slug} member={m} isDarkMode={isDarkMode} />
        ))}
      </div>
    </div>
  );
}
