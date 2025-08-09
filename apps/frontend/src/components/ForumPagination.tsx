import React from 'react';
import Link from 'next/link';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ForumPaginationProps {
  meta: PaginationMeta;
  baseUrl: string;
  searchParams?: Record<string, string>;
  className?: string;
}

export const ForumPagination: React.FC<ForumPaginationProps> = ({
  meta,
  baseUrl,
  searchParams = {},
  className = '',
}) => {
  const { page, totalPages, hasNextPage, hasPreviousPage } = meta;

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams({
      ...searchParams,
      page: pageNum.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={buildUrl(i)}
          className={`px-3 py-2 mx-1 text-sm font-medium rounded-md transition-colors duration-200 ${
            i === page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          data-testid={i === page ? 'current-page' : `page-${i}`}
        >
          {i}
        </Link>
      );
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center justify-between ${className}`}
      aria-label="Paginación del foro"
      data-testid="pagination"
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Página {page} de {totalPages}
        </span>
      </div>

      <div className="flex items-center space-x-1">
        {/* Previous button */}
        {hasPreviousPage && (
          <Link
            href={buildUrl(page - 1)}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            data-testid="previous-page"
          >
            Anterior
          </Link>
        )}

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {renderPageNumbers()}
        </div>

        {/* Next button */}
        {hasNextPage && (
          <Link
            href={buildUrl(page + 1)}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            data-testid="next-page"
          >
            Siguiente
          </Link>
        )}
      </div>
    </nav>
  );
};
