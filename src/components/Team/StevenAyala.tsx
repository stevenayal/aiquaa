import stevenData from '../../data/team/steven-ayala.json';

const StevenAyala = () => {
  return (
    <div className="bg-primary rounded-xl shadow-2xl overflow-hidden border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-accent/10">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-accent/20 to-accent/10 p-6">
        <div className="flex items-center space-x-4">
          {/* Avatar placeholder con iniciales */}
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <span className="text-dark font-bold text-xl">SA</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neutral mb-1">{stevenData.name}</h3>
            <p className="text-accent font-semibold">{stevenData.role}</p>
            <p className="text-neutral/80 text-sm">{stevenData.company}</p>
            <div className="flex items-center mt-1">
              <svg className="w-4 h-4 text-accent mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-neutral/70 text-sm">{stevenData.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Descripción */}
        <div className="mb-6">
          <p className="text-neutral/90 leading-relaxed">
            {stevenData.description}
          </p>
        </div>

        {/* Habilidades */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-neutral mb-3 flex items-center">
            <svg className="w-5 h-5 text-accent mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Habilidades Principales
          </h4>
          <div className="flex flex-wrap gap-2">
            {stevenData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium border border-accent/20 hover:bg-accent/20 transition-colors duration-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Botón LinkedIn */}
        <div className="flex justify-center">
          <a
            href={stevenData.profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border-2 border-neutral text-neutral hover:bg-accent hover:text-dark hover:border-accent font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Ver LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default StevenAyala; 