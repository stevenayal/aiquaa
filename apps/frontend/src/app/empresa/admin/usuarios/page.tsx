'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getMyEmpresaAction,
  getEmpresaMembersAction,
  findUserForInviteAction,
  inviteMemberAction,
  inviteNewUserByEmailAction,
  updateMemberStatusAction,
  updateMemberRoleAction,
  removeMemberAction,
  type Empresa,
  type EmpresaMiembro,
  type EmpresaMemberRole,
  type EmpresaMemberStatus,
} from '@/actions/empresa-admin';

const ROLE_LABELS: Record<EmpresaMemberRole, string> = {
  owner: 'Propietario',
  admin: 'Admin',
  member: 'Miembro',
};

const STATUS_LABELS: Record<EmpresaMemberStatus, string> = {
  active: 'Activo',
  pending: 'Pendiente',
  disabled: 'Deshabilitado',
};

const STATUS_COLORS: Record<EmpresaMemberStatus, string> = {
  active:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  disabled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminUsuariosPage() {
  const { user } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const [isPending, startTransition] = useTransition();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [members, setMembers] = useState<EmpresaMiembro[]>([]);
  const [myRole, setMyRole] = useState<EmpresaMemberRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<EmpresaMemberRole>('member');
  const [activateDirectly, setActivateDirectly] = useState(false);
  const [searchResult, setSearchResult] = useState<
    | { user_id: string; display_name: string; already_member: boolean }
    | null
    | 'not_found'
  >(undefined as any);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  const cardBg = isDarkMode
    ? 'bg-dark-secondary border-dark-secondary'
    : 'bg-white border-gray-200';

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm outline-none ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
  }`;

  function reload() {
    setLoading(true);
    Promise.all([getMyEmpresaAction(), getEmpresaMembersAction()])
      .then(([emp, mem]) => {
        if (emp.data) setEmpresa(emp.data);
        if (mem.data) {
          setMembers(mem.data);
          const me = mem.data.find((m) => m.user_id === user?.id);
          setMyRole(me?.role ?? null);
        }
        if (emp.error && emp.error !== 'No rows found') setErrorMsg(emp.error);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (user) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const canManage = myRole === 'owner' || myRole === 'admin';

  async function handleSearch() {
    setSearchResult(undefined as any);
    setInviteMsg(null);
    const result = await findUserForInviteAction(inviteEmail);
    if (result.error) {
      setInviteMsg(result.error);
      return;
    }
    setSearchResult(result.data ? result.data : 'not_found');
  }

  async function handleInvite() {
    if (!searchResult || searchResult === 'not_found') return;
    startTransition(async () => {
      const result = await inviteMemberAction(
        searchResult.user_id,
        inviteRole,
        activateDirectly
      );
      if (result.error) {
        setInviteMsg(result.error);
      } else {
        setInviteEmail('');
        setSearchResult(undefined as any);
        setInviteMsg(
          activateDirectly
            ? 'Usuario habilitado correctamente.'
            : 'Invitación enviada correctamente.'
        );
        reload();
      }
    });
  }

  async function handleEmailInvite() {
    startTransition(async () => {
      const result = await inviteNewUserByEmailAction(
        inviteEmail,
        inviteRole,
        activateDirectly
      );
      if (result.error) {
        setInviteMsg(result.error);
      } else {
        setInviteEmail('');
        setSearchResult(undefined as any);
        setInviteMsg(
          'Invitación enviada. El usuario recibirá un email para crear su contraseña.'
        );
        reload();
      }
    });
  }

  function handleStatusChange(memberId: string, status: EmpresaMemberStatus) {
    startTransition(async () => {
      const result = await updateMemberStatusAction(memberId, status);
      if (result.error) setErrorMsg(result.error);
      else reload();
    });
  }

  function handleRoleChange(memberId: string, role: EmpresaMemberRole) {
    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, role);
      if (result.error) setErrorMsg(result.error);
      else reload();
    });
  }

  function handleRemove(memberId: string) {
    if (!confirm('¿Eliminar a este usuario de la empresa?')) return;
    startTransition(async () => {
      const result = await removeMemberAction(memberId);
      if (result.error) setErrorMsg(result.error);
      else reload();
    });
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <p className={textSecondary}>Cargando...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <p className={textSecondary}>No pertenecés a ninguna empresa.</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🏢</span>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>
              Gestión de usuarios
            </h1>
          </div>
          <p className={`text-sm ${textSecondary}`}>
            {empresa.nombre_comercial || empresa.razon_social}
            {empresa.ruc && (
              <span className="ml-2 font-mono">RUC {empresa.ruc}</span>
            )}
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 text-sm text-red-700 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Invite / add user — only owner/admin */}
        {canManage && (
          <div className={`rounded-xl border p-6 ${cardBg}`}>
            <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>
              Agregar usuario
            </h2>

            <div className="flex gap-2 mb-3">
              <input
                type="email"
                className={inputClass}
                placeholder="email@usuario.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setSearchResult(undefined as any);
                  setInviteMsg(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={!inviteEmail.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                Buscar
              </button>
            </div>

            {/* Search result */}
            {searchResult === 'not_found' && (
              <div
                className={`rounded-lg border p-4 space-y-3 ${isDarkMode ? 'border-slate-600 bg-slate-700/40' : 'border-gray-200 bg-gray-50'}`}
              >
                <p className={`text-sm ${textSecondary}`}>
                  No tiene cuenta en AIQUAA todavía. Podés enviarle una
                  invitación para que cree su contraseña.
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className={`block text-xs mb-1 ${textSecondary}`}>
                      Rol
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as EmpresaMemberRole)
                      }
                      className={`${inputClass} w-auto`}
                    >
                      <option value="member">Miembro</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    onClick={handleEmailInvite}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 transition-colors"
                  >
                    Enviar invitación por email
                  </button>
                </div>
              </div>
            )}

            {searchResult && searchResult !== 'not_found' && (
              <div
                className={`rounded-lg border p-4 space-y-3 ${isDarkMode ? 'border-slate-600 bg-slate-700/40' : 'border-gray-200 bg-gray-50'}`}
              >
                <p className={`text-sm font-medium ${textPrimary}`}>
                  {searchResult.display_name}
                  {searchResult.already_member && (
                    <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                      (ya es miembro)
                    </span>
                  )}
                </p>

                {!searchResult.already_member && (
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className={`block text-xs mb-1 ${textSecondary}`}>
                        Rol
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as EmpresaMemberRole)
                        }
                        className={`${inputClass} w-auto`}
                      >
                        <option value="member">Miembro</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <label
                      className={`flex items-center gap-2 text-sm cursor-pointer ${textSecondary}`}
                    >
                      <input
                        type="checkbox"
                        checked={activateDirectly}
                        onChange={(e) => setActivateDirectly(e.target.checked)}
                        className="rounded"
                      />
                      Habilitar directamente (sin confirmación)
                    </label>
                    <button
                      onClick={handleInvite}
                      disabled={isPending}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium disabled:opacity-40 transition-colors"
                    >
                      {activateDirectly ? 'Habilitar' : 'Invitar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {inviteMsg && (
              <p
                className={`mt-2 text-sm ${inviteMsg.includes('correctamente') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {inviteMsg}
              </p>
            )}
          </div>
        )}

        {/* Members table */}
        <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className={`text-base font-semibold ${textPrimary}`}>
              Usuarios ({members.length})
            </h2>
          </div>

          {members.length === 0 ? (
            <p className={`px-6 py-8 text-sm text-center ${textSecondary}`}>
              No hay usuarios todavía.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {members.map((m) => {
                const isMe = m.user_id === user?.id;
                const isOwner = m.role === 'owner';
                return (
                  <div
                    key={m.id}
                    className="px-6 py-4 flex flex-wrap items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${textPrimary}`}
                      >
                        {m.profiles?.display_name || 'Sin nombre'}
                        {isMe && (
                          <span className={`ml-2 text-xs ${textSecondary}`}>
                            (vos)
                          </span>
                        )}
                      </p>
                      {m.profiles?.email && (
                        <p className={`text-xs truncate ${textSecondary}`}>
                          {m.profiles.email}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[m.status]}`}
                    >
                      {STATUS_LABELS[m.status]}
                    </span>

                    {canManage && !isOwner && !isMe ? (
                      <>
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(
                              m.id,
                              e.target.value as EmpresaMemberRole
                            )
                          }
                          disabled={isPending}
                          className={`text-xs rounded-lg border px-2 py-1 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                          <option value="member">Miembro</option>
                          <option value="admin">Admin</option>
                        </select>

                        {m.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(m.id, 'active')}
                            disabled={isPending}
                            className="text-xs px-2 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 transition-colors"
                          >
                            Habilitar
                          </button>
                        )}
                        {m.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(m.id, 'disabled')}
                            disabled={isPending}
                            className="text-xs px-2 py-1 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-40 transition-colors"
                          >
                            Deshabilitar
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(m.id)}
                          disabled={isPending}
                          className="text-xs px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition-colors"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs ${textSecondary}`}>
                        {ROLE_LABELS[m.role]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center">
          <a
            href="/empresa"
            className={`text-sm underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
          >
            ← Volver al panel
          </a>
        </div>
      </div>
    </div>
  );
}
