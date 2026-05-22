'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getAdminUsersAction,
  getAdminProcessesAction,
  getAdminStatsAction,
  changeUserRoleAction,
} from '@/actions/admin';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Role = 'comunidad' | 'employer' | 'admin';
type Tab = 'overview' | 'users' | 'processes';

interface UserRow {
  id: string;
  display_name?: string;
  email?: string;
  role: Role;
  created_at: string;
}

interface ProcessRow {
  id: string;
  code: string;
  company_name: string;
  position_name: string;
  status: string;
  created_at: string;
  expires_at?: string;
  profiles?: { display_name?: string; email?: string };
}

interface Stats {
  userCounts: {
    total: number;
    admins: number;
    employers: number;
    comunidad: number;
  };
  processCounts: { total: number; active: number; closed: number };
  resultCounts: { total: number; passed: number };
}

const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  employer:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  comunidad: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const STATUS_COLORS: Record<string, string> = {
  active:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  draft:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthlySeries(items: Array<{ created_at: string }>, months = 6) {
  const now = new Date();
  const buckets: { key: string; label: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-PY', { month: 'short' });
    buckets.push({ key, label, value: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  items.forEach((item) => {
    const k = monthKey(item.created_at);
    const pos = idx.get(k);
    if (pos !== undefined) buckets[pos].value += 1;
  });
  return buckets.map(({ label, value }) => ({ month: label, value }));
}

export default function AdminPage() {
  const { user, isLoading } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [processes, setProcesses] = useState<ProcessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [roleAlert, setRoleAlert] = useState<{
    userId: string;
    msg: string;
    ok: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    Promise.all([
      getAdminStatsAction(),
      getAdminUsersAction(),
      getAdminProcessesAction(),
    ]).then(([s, u, p]) => {
      if (s.error || u.error || p.error) {
        setAccessError(s.error ?? u.error ?? p.error ?? 'Acceso denegado');
      } else {
        setStats(s.data as Stats);
        setUsers((u.data ?? []) as UserRow[]);
        setProcesses((p.data ?? []) as ProcessRow[]);
      }
      setLoading(false);
    });
  }, [user, isLoading, router]);

  function handleRoleChange(userId: string, newRole: Role) {
    startTransition(async () => {
      const { error } = await changeUserRoleAction(userId, newRole);
      if (error) {
        setRoleAlert({ userId, msg: error, ok: false });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setRoleAlert({ userId, msg: 'Rol actualizado', ok: true });
      }
      setTimeout(() => setRoleAlert(null), 3000);
    });
  }

  const base = isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';
  const card = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';
  const th = isDarkMode
    ? 'text-gray-400 border-gray-700 bg-gray-800/50'
    : 'text-gray-500 border-gray-200 bg-gray-50';
  const td = isDarkMode ? 'border-gray-700' : 'border-gray-100';

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen ${base} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className={`min-h-screen ${base} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 font-medium text-lg">{accessError}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-indigo-500 hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const employers = users.filter((u) => u.role === 'employer');
  const userDistribution = stats
    ? [
        { name: 'Admins', value: stats.userCounts.admins, color: '#ef4444' },
        {
          name: 'Employers',
          value: stats.userCounts.employers,
          color: '#3b82f6',
        },
        {
          name: 'Comunidad',
          value: stats.userCounts.comunidad,
          color: '#10b981',
        },
      ]
    : [];
  const processDistribution = stats
    ? [
        { name: 'Activos', value: stats.processCounts.active },
        { name: 'Cerrados', value: stats.processCounts.closed },
      ]
    : [];
  const usersMonthly = buildMonthlySeries(users);
  const processesMonthly = buildMonthlySeries(processes);

  return (
    <div className={`min-h-screen ${base} py-10 px-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Gestión de usuarios, roles y procesos de selección
          </p>
        </div>

        {/* Tabs */}
        <div
          className={`flex gap-1 p-1 rounded-lg mb-6 w-fit ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
        >
          {(
            [
              { key: 'overview', label: 'Resumen' },
              { key: 'users', label: `Usuarios (${users.length})` },
              { key: 'processes', label: `Procesos (${processes.length})` },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-indigo-600 text-white'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Usuarios totales',
                  value: stats.userCounts.total,
                  color: 'text-indigo-500',
                },
                {
                  label: 'Employers',
                  value: stats.userCounts.employers,
                  color: 'text-blue-500',
                },
                {
                  label: 'Procesos activos',
                  value: stats.processCounts.active,
                  color: 'text-green-500',
                },
                {
                  label: 'Exámenes rendidos',
                  value: stats.resultCounts.total,
                  color: 'text-amber-500',
                },
              ].map((s) => (
                <div key={s.label} className={`${card} border rounded-xl p-5`}>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p
                    className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`${card} border rounded-xl p-4`}>
                <h3 className="text-sm font-semibold mb-3">Usuarios por rol</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={56}
                        outerRadius={88}
                        paddingAngle={3}
                      >
                        {userDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${card} border rounded-xl p-4`}>
                <h3 className="text-sm font-semibold mb-3">
                  Procesos por estado
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`${card} border rounded-xl p-4`}>
                <h3 className="text-sm font-semibold mb-3">
                  Altas de usuarios (6 meses)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usersMonthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#22c55e"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${card} border rounded-xl p-4`}>
                <h3 className="text-sm font-semibold mb-3">
                  Procesos creados (6 meses)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processesMonthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Employers registrados */}
            <div className={`${card} border rounded-xl`}>
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold">Empresas registradas</h2>
                <p
                  className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Usuarios con rol employer habilitados para crear procesos
                </p>
              </div>
              {employers.length === 0 ? (
                <p
                  className={`px-5 py-6 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  No hay employers registrados todavía
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {employers.map((e) => {
                    const empProcesses = processes.filter(
                      (p) => p.profiles?.email === e.email
                    );
                    const active = empProcesses.filter(
                      (p) => p.status === 'active'
                    ).length;
                    return (
                      <div
                        key={e.id}
                        className="px-5 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {e.display_name ?? '—'}
                          </p>
                          <p
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            {e.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {empProcesses.length} procesos
                          </p>
                          <p
                            className={`text-xs ${active > 0 ? 'text-green-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            {active} activos
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className={`${card} border rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`border-b ${th} text-xs uppercase tracking-wider`}
                >
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Registro</th>
                  <th className="px-4 py-3 text-left">Rol actual</th>
                  <th className="px-4 py-3 text-left">Cambiar rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={`border-b ${td} last:border-0`}>
                    <td className="px-4 py-3 font-medium">
                      {u.display_name ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {u.email ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as Role)
                          }
                          disabled={isPending}
                          className={`text-xs px-2 py-1 rounded-lg border outline-none transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="comunidad">comunidad</option>
                          <option value="employer">employer</option>
                          <option value="admin">admin</option>
                        </select>
                        {roleAlert?.userId === u.id && (
                          <span
                            className={`text-xs ${roleAlert.ok ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {roleAlert.msg}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROCESSES */}
        {tab === 'processes' && (
          <div className={`${card} border rounded-xl overflow-hidden`}>
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`border-b ${th} text-xs uppercase tracking-wider`}
                >
                  <th className="px-4 py-3 text-left">Empresa</th>
                  <th className="px-4 py-3 text-left">Posición</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Employer</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Creado</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p) => (
                  <tr key={p.id} className={`border-b ${td} last:border-0`}>
                    <td className="px-4 py-3 font-medium">{p.company_name}</td>
                    <td
                      className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {p.position_name}
                    </td>
                    <td className="px-4 py-3">
                      <code
                        className={`text-xs px-2 py-0.5 rounded font-mono ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        {p.code}
                      </code>
                    </td>
                    <td
                      className={`px-4 py-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {p.profiles?.display_name ?? p.profiles?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
