import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface Comment {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
  isAnonymous: boolean;
}

const Community: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    name: '',
    message: '',
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar comentarios desde localStorage (en producción sería desde backend)
  useEffect(() => {
    const savedComments = localStorage.getItem('community-comments');
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments).map((comment: any) => ({
        ...comment,
        timestamp: new Date(comment.timestamp)
      }));
      setComments(parsedComments);
    }
  }, []);

  // Guardar comentarios en localStorage
  const saveComments = (commentsToSave: Comment[]) => {
    localStorage.setItem('community-comments', JSON.stringify(commentsToSave));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.message.trim()) return;

    setIsSubmitting(true);

    try {
      // Simular envío al backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      const comment: Comment = {
        id: Date.now().toString(),
        name: newComment.isAnonymous ? 'Anónimo' : newComment.name || 'Usuario',
        message: newComment.message.trim(),
        timestamp: new Date(),
        isAnonymous: newComment.isAnonymous
      };

      const updatedComments = [comment, ...comments].slice(0, 20); // Mantener solo los últimos 20
      setComments(updatedComments);
      saveComments(updatedComments);

      // Resetear formulario
      setNewComment({
        name: '',
        message: '',
        isAnonymous: false
      });

      // Mostrar mensaje de éxito
      alert('¡Comentario publicado exitosamente!');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      alert('Error al publicar el comentario. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  };

  const getRandomAvatar = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
    const color = colors[name.length % colors.length];
    return color;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Comunidad - Aiquaa</title>
        <meta name="description" content="Conecta con otros testers y comparte experiencias" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💬 Comunidad de Testers
          </h1>
          <p className="text-xl text-gray-600">
            Conecta con otros profesionales, comparte experiencias y aprende de la comunidad
          </p>
        </div>

        {/* Formulario de comentario */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📝 Comparte tu experiencia
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={newComment.name}
                  onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                  disabled={newComment.isAnonymous}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Tu nombre o apodo"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newComment.isAnonymous}
                  onChange={(e) => setNewComment(prev => ({ 
                    ...prev, 
                    isAnonymous: e.target.checked,
                    name: e.target.checked ? '' : prev.name
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                  Publicar como anónimo
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                id="message"
                value={newComment.message}
                onChange={(e) => setNewComment(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Comparte tu experiencia, pregunta o consejo..."
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {newComment.message.length}/500 caracteres
              </p>
              <button
                type="submit"
                disabled={!newComment.message.trim() || isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de comentarios */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            💭 Comentarios Recientes ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💭</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay comentarios aún
              </h3>
              <p className="text-gray-600">
                ¡Sé el primero en compartir tu experiencia con la comunidad!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getRandomAvatar(comment.name)}`}>
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {comment.name}
                        </h3>
                        {comment.isAnonymous && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Anónimo
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed">
                        {comment.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                          👍 Me gusta
                        </button>
                        <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                          💬 Responder
                        </button>
                        <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                          🔗 Compartir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas de la comunidad */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Estadísticas de la Comunidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{comments.length}</div>
              <div className="text-sm text-gray-600">Comentarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {comments.filter(c => !c.isAnonymous).length}
              </div>
              <div className="text-sm text-gray-600">Usuarios activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(comments.length / 7)}
              </div>
              <div className="text-sm text-gray-600">Promedio semanal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {comments.length > 0 ? formatTimeAgo(comments[comments.length - 1].timestamp) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Último comentario</div>
            </div>
          </div>
        </div>

        {/* Guías de participación */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Guías de Participación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">✅ Lo que está permitido:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Compartir experiencias de testing</li>
                <li>• Hacer preguntas técnicas</li>
                <li>• Recomendar herramientas</li>
                <li>• Discutir mejores prácticas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">❌ Lo que no está permitido:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Spam o publicidad</li>
                <li>• Contenido ofensivo</li>
                <li>• Información personal sensible</li>
                <li>• Enlaces maliciosos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 