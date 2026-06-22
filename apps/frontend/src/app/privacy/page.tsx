import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | AIQUAA',
  description:
    'Política de privacidad de AIQUAA: datos recopilados, finalidad, bases legales, terceros, derechos, retención y seguridad.',
};

const LAST_UPDATED = 'Junio 2026';
const CONTACT_EMAIL = 'stevenayal@proton.me';

interface Section {
  id: string;
  icon: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const SECTIONS: Section[] = [
  {
    id: 'responsable',
    icon: '🛡️',
    title: '1. Responsable del tratamiento',
    paragraphs: [
      'AIQUAA es responsable del tratamiento de los datos personales recolectados a través del sitio, la app, las herramientas de Labs, el foro, el módulo de empresas y los canales de soporte.',
      'Esta política explica qué información tratamos, por qué la tratamos, con quién puede compartirse y qué derechos podés ejercer.',
    ],
  },
  {
    id: 'datos',
    icon: '📝',
    title: '2. Datos que recopilamos',
    paragraphs: [
      'Según el uso que hagas de la plataforma, podemos recopilar datos que nos proporcionás directamente y datos técnicos generados durante el uso del servicio.',
    ],
    bullets: [
      'Datos de cuenta: nombre, email, país, rol o perfil profesional, foto o avatar y preferencias de usuario.',
      'Datos de autenticación: proveedor de acceso utilizado, identificadores técnicos de sesión, estado de login y metadatos de seguridad.',
      'Datos de contenido: publicaciones en el foro, comentarios, reportes, respuestas, mensajes y materiales que subas o envíes.',
      'Datos del módulo de empresas: información de la empresa, procesos de selección, candidatos, resultados de evaluaciones y evidencias asociadas.',
      'Datos de soporte: consultas que nos envíes por email o formularios de contacto.',
      'Datos técnicos: IP, tipo de navegador, dispositivo, sistema operativo, idioma, registros de acceso, errores y actividad de seguridad.',
      'Cookies y almacenamiento local: preferencias, sesión, autenticación y configuraciones necesarias para el funcionamiento de la app.',
    ],
  },
  {
    id: 'finalidades',
    icon: '🎯',
    title: '3. Finalidades del tratamiento',
    paragraphs: [
      'Tratamos los datos para operar la plataforma y proteger a la comunidad.',
    ],
    bullets: [
      'Crear y administrar cuentas, sesiones y accesos.',
      'Habilitar Labs, simuladores, ranking, foro y el módulo de empresas.',
      'Responder consultas, enviar notificaciones y prestar soporte.',
      'Prevenir fraude, abuso, spam, scraping, suplantación y uso no autorizado.',
      'Mejorar la estabilidad, seguridad y calidad del servicio.',
      'Cumplir obligaciones legales, regulatorias y contractuales.',
    ],
  },
  {
    id: 'base-legal',
    icon: '⚖️',
    title: '4. Base legal',
    paragraphs: [
      'Dependiendo del caso, tratamos tus datos sobre una o más de las siguientes bases legales: consentimiento, ejecución del servicio, interés legítimo, obligación legal y, cuando corresponda, el cumplimiento de medidas precontractuales o contractuales.',
      'Cuando el tratamiento requiera consentimiento, podés retirarlo en cualquier momento, sin afectar la licitud del tratamiento realizado antes de la revocación.',
    ],
  },
  {
    id: 'terceros',
    icon: '🔌',
    title: '5. Proveedores y terceros',
    paragraphs: [
      'Podemos utilizar proveedores externos para alojar, autenticar, observar y enviar comunicaciones relacionadas con la plataforma. Estos proveedores pueden procesar datos en nuestro nombre y bajo sus propias políticas.',
    ],
    bullets: [
      'Infraestructura y hosting: Vercel y Railway.',
      'Autenticación y base de datos: Supabase u otros servicios equivalentes de autenticación/almacenamiento que la plataforma use.',
      'Correo electrónico y notificaciones: Resend u otro proveedor similar.',
      'Observabilidad y monitoreo: herramientas de logs, métricas, errores y trazas, como Sentry u OpenTelemetry, si están activas.',
    ],
  },
  {
    id: 'cookies',
    icon: '🍪',
    title: '6. Cookies y almacenamiento local',
    paragraphs: [
      'Usamos cookies y almacenamiento local únicamente cuando son necesarios para la autenticación, la sesión, las preferencias, la seguridad y la experiencia de uso.',
      'Podés configurar tu navegador para bloquear ciertas cookies, pero algunas funciones podrían dejar de funcionar correctamente.',
    ],
  },
  {
    id: 'labs',
    icon: '🛠️',
    title: '7. Herramientas de Labs',
    paragraphs: [
      'Muchas herramientas de Labs procesan información directamente en tu navegador y, en esos casos, AIQUAA no almacena el contenido en nuestros servidores salvo que la herramienta indique lo contrario.',
      'Si una herramienta envía datos a un servidor para responder una solicitud, mostrar resultados o generar contenido, esa operación se informará de forma visible en la propia funcionalidad.',
    ],
  },
  {
    id: 'retencion',
    icon: '🗂️',
    title: '8. Conservación y eliminación',
    paragraphs: [
      'Conservamos los datos solo durante el tiempo necesario para cumplir las finalidades descritas, resolver disputas, hacer cumplir nuestros términos y cumplir obligaciones legales.',
      'Cuando cierres tu cuenta, podremos conservar cierta información de forma limitada por motivos legales, de seguridad, antifraude o auditoría.',
    ],
  },
  {
    id: 'transferencias',
    icon: '🌍',
    title: '9. Transferencias internacionales',
    paragraphs: [
      'La plataforma puede procesar datos fuera de Paraguay, incluido en países donde operan nuestros proveedores de infraestructura y comunicaciones.',
      'Cuando corresponda, aplicamos salvaguardas contractuales y organizativas razonables para proteger esa información.',
    ],
  },
  {
    id: 'derechos',
    icon: '🙋',
    title: '10. Tus derechos',
    paragraphs: [
      'Según la legislación aplicable, podés solicitar acceso, rectificación, actualización, eliminación, oposición, limitación y portabilidad de tus datos.',
      'También podés retirar tu consentimiento cuando ese sea el fundamento del tratamiento, o solicitar la baja de comunicaciones no esenciales.',
    ],
    bullets: [
      'Podés escribirnos para ejercer tus derechos y te responderemos dentro de un plazo razonable.',
      'Si la ley exige conservar parte de la información, te explicaremos qué datos no pueden eliminarse y por qué.',
    ],
  },
  {
    id: 'seguridad',
    icon: '🔐',
    title: '11. Seguridad',
    paragraphs: [
      'Aplicamos medidas técnicas y organizativas razonables para proteger la información contra acceso no autorizado, pérdida, alteración o divulgación indebida.',
      'Ningún sistema es totalmente invulnerable, por lo que no podemos garantizar seguridad absoluta, pero sí hacemos esfuerzos razonables para reducir los riesgos.',
    ],
  },
  {
    id: 'menores',
    icon: '👶',
    title: '12. Menores de edad',
    paragraphs: [
      'La plataforma no está dirigida a menores de edad sin supervisión. Si tenés la edad mínima legal de tu país, o 16 años como mínimo general, podés usar la plataforma solo si la ley lo permite.',
      'Si detectamos una cuenta creada por un menor sin autorización válida, podremos suspenderla o eliminarla.',
    ],
  },
  {
    id: 'empresas',
    icon: '🏢',
    title: '13. Módulo de empresas',
    paragraphs: [
      'Cuando una empresa utiliza la plataforma para reclutar o evaluar candidatos, tratamos los datos necesarios para administrar el proceso y permitir el acceso a resultados.',
      'La empresa es responsable de usar esos datos solo para fines legítimos de selección, cumplir la normativa aplicable y respetar los derechos de los candidatos.',
    ],
  },
  {
    id: 'no-venta',
    icon: '🚫',
    title: '14. No vendemos tus datos',
    paragraphs: [
      'AIQUAA no vende tus datos personales ni los utiliza para publicidad comportamental de terceros.',
      'Tampoco compartimos información con terceros para fines comerciales ajenos a la prestación, seguridad o mejora del servicio, salvo obligación legal o consentimiento expreso.',
    ],
  },
  {
    id: 'cambios',
    icon: '🔄',
    title: '15. Cambios en esta política',
    paragraphs: [
      'Podemos actualizar esta política para reflejar cambios en la plataforma, en nuestros proveedores o en la normativa aplicable.',
      'Cuando hagamos cambios materiales, publicaremos la nueva versión y, si corresponde, daremos aviso adicional por medios razonables.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Política de Privacidad
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Cómo recopilamos, usamos y protegemos tu información en AIQUAA
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-4" aria-hidden="true">
              🔒
            </div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">
              Tu privacidad importa
            </h2>
            <p className="text-lg text-brand-text leading-relaxed">
              AIQUAA trata tus datos solo cuando es necesario para brindarte el
              servicio, proteger la plataforma y cumplir obligaciones legales.
              No vendemos tus datos ni los usamos para publicidad de terceros.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg shadow-lg p-6 md:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0" aria-hidden="true">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-4">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-brand-text mb-3 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc list-inside space-y-2 mt-2 text-brand-text">
                      {section.bullets.map((bullet, index) => (
                        <li key={index} className="leading-relaxed">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 my-8">
          <div className="text-center">
            <div className="text-4xl mb-4" aria-hidden="true">
              📧
            </div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">
              Contacto
            </h2>
            <p className="text-lg text-brand-text mb-4">
              Si tenés consultas sobre privacidad o querés ejercer tus derechos,
              escribinos a:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-brand-primary hover:text-brand-primary-dark font-semibold text-lg transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="bg-brand-primary/10 rounded-lg p-6 text-center">
          <p className="text-brand-text font-medium">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>
      </div>
    </div>
  );
}
