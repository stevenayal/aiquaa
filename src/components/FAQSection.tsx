import { Helmet } from 'react-helmet-async';

const FAQSection = () => {
  const faqs = [
    {
      question: "¿Qué es AIQUAA?",
      answer: "AIQUAA es una comunidad de testers en Paraguay que ofrece herramientas y recursos gratuitos de QA. Inspirada en el término guaraní 'aikuaa' que significa saber o conocer, nuestra misión es construir una comunidad comprometida con la calidad y la excelencia profesional."
    },
    {
      question: "¿Las herramientas son gratuitas?",
      answer: "Sí, todas las herramientas disponibles en AIQUAA son 100% gratuitas y accesibles desde la web. No hay costos ocultos ni suscripciones requeridas."
    },
    {
      question: "¿Qué herramientas ofrece AIQUAA?",
      answer: "Ofrecemos validador de JSON, generador de datos, checklist de pruebas, decodificador Base64, decodificador JWT, validador de YAML, validador de cron y generador de objetos SQL, todas diseñadas específicamente para testers."
    },
    {
      question: "¿Puedo contribuir al proyecto?",
      answer: "¡Absolutamente! AIQUAA es una comunidad abierta. Podés contribuir reportando bugs, sugiriendo nuevas herramientas, mejorando la documentación o participando en nuestros eventos y mentorías."
    },
    {
      question: "¿Hay eventos o capacitaciones?",
      answer: "Sí, organizamos eventos regulares, mentorías y capacitaciones sobre testing, automatización y buenas prácticas de QA. Seguí nuestras redes sociales para estar al tanto."
    }
  ];

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>
      
      <section className="py-12 bg-brand-light">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-accent mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-brand-text mb-3">
                  {faq.question}
                </h3>
                <p className="text-brand-text">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection; 