import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import posts from '../data/posts.json';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const tag = searchParams.get('tag');

  useEffect(() => {
    if (tag) {
      setSelectedTag(tag);
      setSearchTerm('');
    }
  }, [tag]);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedTag]);

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag('');
      setSearchParams({});
    } else {
      setSelectedTag(tag);
      setSearchParams({ tag });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>Blog - AIQUAA</title>
        <meta name="description" content="Artículos sobre testing de software, automatización, inteligencia artificial y mejores prácticas de QA. Mantente actualizado con las últimas tendencias." />
        <meta property="og:title" content="Blog - AIQUAA" />
        <meta property="og:description" content="Artículos sobre testing de software, automatización, inteligencia artificial y mejores prácticas de QA." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Blog AIQUAA
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 px-4">
              Artículos sobre testing de software, automatización y mejores prácticas de QA
            </p>
          </header>

          {/* Search and Filters */}
          <aside className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  aria-label="Buscar artículos"
                />
              </div>
              {(searchTerm || selectedTag) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>

            {/* Tags */}
            <nav className="flex flex-wrap gap-2" aria-label="Filtros por etiquetas">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={selectedTag === tag}
                >
                  {tag}
                </button>
              ))}
            </nav>
          </aside>

          {/* Results count */}
          <section className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          </section>

          {/* Articles Grid */}
          {filteredPosts.length > 0 ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  itemScope
                  itemType="https://schema.org/BlogPosting"
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    itemProp="image"
                  />
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2" itemProp="headline">
                      {post.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3" itemProp="description">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <time 
                        className="text-sm text-gray-500 dark:text-gray-400"
                        itemProp="datePublished"
                        dateTime={post.publishedAt}
                      >
                        {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span className="text-sm text-gray-500 dark:text-gray-400" itemProp="author">
                        {post.author}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {post.readTime}
                      </span>
                      <Link
                        to={`/article/${post.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        itemProp="url"
                      >
                        Leer más →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <section className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron artículos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intenta con otros términos de búsqueda o filtros
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default Blog; 