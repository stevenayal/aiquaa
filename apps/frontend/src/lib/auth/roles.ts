/**
 * Roles de comunidad que un usuario puede declarar al registrarse.
 *
 * Única fuente de verdad: la usan el formulario de registro (AuthForm),
 * la validación (validateRegisterForm) y la persistencia (registerAction).
 * Antes cada uno tenía su propia lista y la de persistencia no coincidía
 * con la del formulario, por lo que el rol elegido se descartaba en silencio.
 *
 * OJO: este `role` es un dato declarativo de perfil, NO un permiso.
 * La autorización no debe basarse en este valor.
 */
export const COMMUNITY_ROLES = [
  { value: 'estudiante', label: 'Estudiante', emoji: '🎓' },
  { value: 'qa_junior', label: 'Tester QA Junior', emoji: '🌱' },
  { value: 'qa_senior', label: 'Tester QA Senior', emoji: '⭐' },
  { value: 'qa_engineer', label: 'QA Engineer', emoji: '⚙️' },
  { value: 'analista_qa', label: 'Analista QA', emoji: '🔍' },
  { value: 'developer', label: 'Developer', emoji: '💻' },
  { value: 'otro', label: 'Otro rol', emoji: '🙋' },
] as const;

export type CommunityRole = (typeof COMMUNITY_ROLES)[number]['value'];

export const COMMUNITY_ROLE_VALUES: readonly string[] = COMMUNITY_ROLES.map(
  (r) => r.value
);

export function isCommunityRole(value: unknown): value is CommunityRole {
  return typeof value === 'string' && COMMUNITY_ROLE_VALUES.includes(value);
}
