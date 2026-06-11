import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | AIQUAA',
  description:
    'Condiciones de uso de AIQUAA: cuentas de usuario, herramientas de Labs, simuladores, gamificación, comunidad y módulo de empresas.',
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
    id: 'aceptacion',
    icon: '🤝',
    title: '1. Aceptación de los términos',
    paragraphs: [
      'Al acceder o utilizar aiquaa.com, sus herramientas, simuladores, foros y demás servicios (en adelante, "la Plataforma"), aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices la Plataforma.',
      'Estos términos aplican tanto a usuarios que navegan sin registrarse como a quienes crean una cuenta.',
    ],
  },
  {
    id: 'servicio',
    icon: '🎯',
    title: '2. Descripción del servicio',
    paragraphs: [
      'AIQUAA es una plataforma gratuita de entrenamiento en QA (aseguramiento de la calidad de software) para la comunidad de habla hispana de Latinoamérica. Ofrece herramientas de testing, simuladores de examen, contenido educativo, un foro comunitario y un módulo de empresas.',
      'El servicio se brinda de forma gratuita y con fines educativos y de apoyo a la comunidad. No garantizamos disponibilidad ininterrumpida ni la ausencia de errores.',
    ],
  },
  {
    id: 'cuentas',
    icon: '👤',
    title: '3. Registro y cuentas de usuario',
    paragraphs: [
      'Algunas funciones requieren crear una cuenta. Podés registrarte con email y contraseña o mediante proveedores externos (Google o GitHub). La autenticación se gestiona a través de Supabase.',
      'Sos responsable de mantener la confidencialidad de tus credenciales y de toda la actividad realizada desde tu cuenta. Debés notificarnos ante cualquier uso no autorizado.',
    ],
    bullets: [
      'Debés tener al menos 16 años, o la edad mínima legal de tu país, para crear una cuenta.',
      'La información que proporciones (nombre, país, perfil profesional) debe ser veraz.',
      'No está permitido crear cuentas múltiples para manipular rankings o evadir restricciones.',
    ],
  },
  {
    id: 'uso-aceptable',
    icon: '✅',
    title: '4. Uso aceptable',
    paragraphs: [
      'Te comprometés a utilizar la Plataforma de manera responsable, ética y conforme a la ley. El uso debe orientarse a fines legítimos de aprendizaje, testing y desarrollo profesional.',
    ],
    bullets: [
      'No realizar ataques, scraping masivo, pruebas de carga no autorizadas ni intentos de vulnerar la seguridad de la Plataforma o de otros usuarios.',
      'No publicar contenido ilegal, ofensivo, difamatorio, spam o que infrinja derechos de terceros.',
      'No usar las herramientas para dañar sistemas ajenos ni con fines maliciosos.',
      'No suplantar la identidad de otras personas u organizaciones.',
    ],
  },
  {
    id: 'contenido-usuario',
    icon: '💬',
    title: '5. Contenido generado por usuarios',
    paragraphs: [
      'La Plataforma permite publicar contenido: hilos y respuestas en el foro, ideas, reportes de bugs, comentarios y datos de perfil. Conservás la titularidad de lo que publicás, pero nos otorgás una licencia no exclusiva y gratuita para mostrarlo y distribuirlo dentro de la Plataforma.',
      'Sos el único responsable del contenido que publicás. Nos reservamos el derecho de moderar, editar o eliminar contenido que infrinja estos términos, sin previo aviso.',
    ],
  },
  {
    id: 'examenes',
    icon: '🎓',
    title: '6. Simuladores, exámenes y gamificación',
    paragraphs: [
      'Los simuladores (incluido el de ISTQB® CTFL, Git, Performance y otros) son herramientas de práctica con fines educativos. No constituyen certificaciones oficiales ni reemplazan a los exámenes acreditados por las entidades correspondientes.',
      '"ISTQB" es una marca registrada de International Software Testing Qualifications Board. AIQUAA no está afiliada, patrocinada ni avalada por ISTQB ni por ninguna entidad certificadora; sus contenidos de práctica son material independiente.',
      'El sistema de puntos de experiencia (XP), niveles, logros y rankings tiene fines lúdicos y motivacionales. Nos reservamos el derecho de ajustar las reglas, recalcular puntajes o anular resultados obtenidos de forma fraudulenta.',
    ],
  },
  {
    id: 'empresas',
    icon: '🏢',
    title: '7. Módulo de empresas y reclutamiento',
    paragraphs: [
      'Las empresas pueden registrarse para crear procesos de selección, invitar candidatos y revisar resultados de evaluaciones. Al usar este módulo, las empresas se comprometen a tratar los datos de los candidatos conforme a la legislación aplicable de protección de datos y a utilizarlos únicamente para fines de reclutamiento legítimos.',
      'Los candidatos que aceptan participar en un proceso consienten que su empresa evaluadora acceda a los resultados asociados a dicho proceso.',
    ],
  },
  {
    id: 'propiedad',
    icon: '©️',
    title: '8. Propiedad intelectual',
    paragraphs: [
      'Salvo que se indique lo contrario, el contenido educativo original de AIQUAA está licenciado bajo Creative Commons CC BY-NC-SA 4.0, permitiendo su uso no comercial con atribución y bajo la misma licencia.',
      'El código, la marca AIQUAA, el diseño y los logotipos son propiedad de AIQUAA. Las marcas, nombres y logotipos de terceros mencionados en la Plataforma pertenecen a sus respectivos titulares.',
    ],
  },
  {
    id: 'terceros',
    icon: '🔌',
    title: '9. Servicios de terceros',
    paragraphs: [
      'La Plataforma se apoya en proveedores externos para funcionar: Supabase (autenticación, base de datos y almacenamiento), Vercel y Railway (alojamiento) y Resend (envío de correos). El uso de la Plataforma implica que cierta información se procese a través de estos servicios conforme a sus propias políticas.',
      'No nos responsabilizamos por interrupciones, fallos o cambios en estos servicios de terceros.',
    ],
  },
  {
    id: 'privacidad',
    icon: '🔒',
    title: '10. Privacidad y datos personales',
    paragraphs: [
      'El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos términos. Al usar la Plataforma, aceptás dicho tratamiento.',
      'Podés solicitar el acceso, la rectificación o la eliminación de tus datos escribiéndonos al correo de contacto.',
    ],
  },
  {
    id: 'disponibilidad',
    icon: '⚙️',
    title: '11. Disponibilidad y cambios en el servicio',
    paragraphs: [
      'La Plataforma se ofrece "tal cual" y "según disponibilidad". Podemos modificar, suspender o discontinuar cualquier funcionalidad, herramienta o contenido en cualquier momento y sin previo aviso.',
      'No garantizamos que el servicio esté libre de errores ni que sea ininterrumpido.',
    ],
  },
  {
    id: 'responsabilidad',
    icon: '⚠️',
    title: '12. Limitación de responsabilidad',
    paragraphs: [
      'AIQUAA no se responsabiliza por daños, pérdidas de datos o decisiones derivadas del uso de la Plataforma o de los resultados obtenidos con sus herramientas. Es tu responsabilidad verificar la precisión y adecuación de dichos resultados antes de aplicarlos en entornos reales.',
      'En la máxima medida permitida por la ley, nuestra responsabilidad total frente a vos queda limitada, dado que el servicio se presta de forma gratuita.',
    ],
  },
  {
    id: 'terminacion',
    icon: '🚪',
    title: '13. Suspensión y terminación de cuentas',
    paragraphs: [
      'Podemos suspender o eliminar tu cuenta si incumplís estos términos, realizás un uso fraudulento o ponés en riesgo a la comunidad o a la Plataforma. Podés solicitar la eliminación de tu cuenta en cualquier momento contactándonos.',
    ],
  },
  {
    id: 'modificaciones',
    icon: '🔄',
    title: '14. Cambios en los términos',
    paragraphs: [
      'Podemos actualizar estos Términos y Condiciones para reflejar cambios en la Plataforma o en la normativa aplicable. La fecha de última actualización figura al final de esta página. El uso continuado del servicio tras una modificación implica la aceptación de los nuevos términos.',
    ],
  },
  {
    id: 'ley',
    icon: '⚖️',
    title: '15. Ley aplicable y jurisdicción',
    paragraphs: [
      'Estos términos se rigen por las leyes de la República del Paraguay. Cualquier controversia se someterá a los tribunales competentes de dicha jurisdicción, sin perjuicio de los derechos que la normativa de protección al consumidor reconozca al usuario en su país de residencia.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-light py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-brand-muted max-w-3xl mx-auto">
            Condiciones de uso de AIQUAA, sus herramientas, simuladores y
            comunidad
          </p>
        </div>

        {/* Intro card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-2">
            <div className="text-4xl mb-4" aria-hidden="true">
              📋
            </div>
            <p className="text-lg text-brand-text">
              AIQUAA es una plataforma gratuita de entrenamiento QA para la
              comunidad de Latinoamérica. Estos términos explican las reglas de
              uso del sitio, las cuentas de usuario y todos sus módulos. Te
              recomendamos leerlos con atención.
            </p>
          </div>
        </div>

        {/* Sections */}
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
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-brand-text mb-3 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-disc list-inside space-y-2 mt-2 text-brand-text">
                      {section.bullets.map((b, i) => (
                        <li key={i} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-lg p-8 my-8">
          <div className="text-center">
            <div className="text-4xl mb-4" aria-hidden="true">
              📧
            </div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">Contacto</h2>
            <p className="text-lg text-brand-text mb-4">
              Si tenés dudas sobre estos términos, o querés ejercer tus derechos
              sobre tus datos, escribinos a:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-brand-primary hover:text-brand-primary-dark font-semibold text-lg transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Last updated */}
        <div className="bg-brand-primary/10 rounded-lg p-6 text-center">
          <p className="text-brand-text font-medium">
            Última actualización: {LAST_UPDATED}
          </p>
        </div>
      </div>
    </div>
  );
}
