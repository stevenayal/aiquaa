import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

const Breadcrumb = () => {
  const location = useLocation();
  
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    if (pathSegments.length === 0) return [];
    
    const items: BreadcrumbItem[] = [
      { label: 'Inicio', path: '/', isActive: false }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment;
      
      // Mapear segmentos a nombres más amigables
      switch (segment) {
        case 'labs':
          label = 'Labs';
          break;
        case 'json-validator':
          label = 'Validador JSON';
          break;
        case 'data-generator':
          label = 'Generador de Datos';
          break;
        case 'checklist':
          label = 'Checklist';
          break;
        default:
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      items.push({
        label,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();
  
  if (breadcrumbItems.length <= 1) return null;
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              
              {item.isActive ? (
                <span className="text-gray-900 font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb; 