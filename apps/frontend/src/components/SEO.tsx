import React from 'react';

interface SEOJsonLdProps {
  type: 'Article' | 'DiscussionForumPosting' | 'Course';
  data: any;
}

export const SEOJsonLd: React.FC<SEOJsonLdProps> = ({ type, data }) => {
  const generateJsonLd = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'Article':
        return {
          ...baseData,
          headline: data.title,
          description: data.description || data.content?.substring(0, 160),
          author: {
            '@type': 'Person',
            name: data.author?.name || 'Anonymous',
          },
          datePublished: data.createdAt,
          dateModified: data.updatedAt,
          publisher: {
            '@type': 'Organization',
            name: 'AIQUAA',
            logo: {
              '@type': 'ImageObject',
              url: 'https://aiquaa.com/images/aiquaa-logo.png',
            },
          },
        };

      case 'DiscussionForumPosting':
        return {
          ...baseData,
          headline: data.title,
          text: data.content,
          author: {
            '@type': 'Person',
            name: data.author?.name || 'Anonymous',
          },
          dateCreated: data.createdAt,
          dateModified: data.updatedAt,
          discussionUrl: data.url,
        };

      case 'Course':
        return {
          ...baseData,
          name: data.title,
          description: data.description,
          provider: {
            '@type': 'Organization',
            name: 'AIQUAA',
            sameAs: 'https://aiquaa.com',
          },
          coursePrerequisites: data.prerequisites,
          educationalLevel: data.level || 'Beginner',
        };

      default:
        return baseData;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateJsonLd()),
      }}
    />
  );
};

export default SEOJsonLd;
