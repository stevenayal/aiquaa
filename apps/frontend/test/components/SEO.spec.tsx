import { render } from '@testing-library/react';
import { SEOJsonLd } from '../../src/components/SEO';

describe('SEOJsonLd', () => {
  it('should render Article JSON-LD correctly', () => {
    const articleData = {
      title: 'Test Article',
      description: 'Test Description',
      content: 'Test content for the article',
      author: { name: 'John Doe' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    const { container } = render(
      <SEOJsonLd type="Article" data={articleData} />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    const jsonContent = JSON.parse(script?.textContent || '{}');
    expect(jsonContent['@type']).toBe('Article');
    expect(jsonContent.headline).toBe('Test Article');
    expect(jsonContent.author.name).toBe('John Doe');
  });

  it('should render DiscussionForumPosting JSON-LD correctly', () => {
    const threadData = {
      title: 'Test Thread',
      content: 'Test thread content',
      author: { name: 'Jane Doe' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      url: 'https://example.com/thread/1',
    };

    const { container } = render(
      <SEOJsonLd type="DiscussionForumPosting" data={threadData} />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    const jsonContent = JSON.parse(script?.textContent || '{}');
    expect(jsonContent['@type']).toBe('DiscussionForumPosting');
    expect(jsonContent.headline).toBe('Test Thread');
    expect(jsonContent.discussionUrl).toBe('https://example.com/thread/1');
  });

  it('should render Course JSON-LD correctly', () => {
    const courseData = {
      title: 'Test Course',
      description: 'Test course description',
      prerequisites: 'Basic knowledge',
      level: 'Intermediate',
    };

    const { container } = render(
      <SEOJsonLd type="Course" data={courseData} />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    const jsonContent = JSON.parse(script?.textContent || '{}');
    expect(jsonContent['@type']).toBe('Course');
    expect(jsonContent.name).toBe('Test Course');
    expect(jsonContent.educationalLevel).toBe('Intermediate');
  });
});
