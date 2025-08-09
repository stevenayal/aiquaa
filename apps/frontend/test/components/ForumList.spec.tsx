import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useState, useEffect } from 'react';

// Mock del componente ForumList
const MockForumList = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch('/api/v1/forum/threads');
        if (!response.ok) {
          throw new Error('Failed to fetch threads');
        }
        const data = await response.json();
        setThreads(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  if (loading) return <div>Loading threads...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Forum Threads</h2>
      {threads.map((thread: any) => (
        <div key={thread.id} className="thread-item">
          <h3>{thread.title}</h3>
          <p>{thread.content}</p>
          <span>By: {thread.author.name}</span>
        </div>
      ))}
    </div>
  );
};

describe('ForumList', () => {
  it('should render loading state initially', () => {
    render(<MockForumList />);
    expect(screen.getByText('Loading threads...')).toBeInTheDocument();
  });

  it('should render threads when data is loaded', async () => {
    render(<MockForumList />);

    await waitFor(() => {
      expect(screen.getByText('Forum Threads')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Thread 1')).toBeInTheDocument();
    expect(screen.getByText('Test Thread 2')).toBeInTheDocument();
  });

  it('should render error when API fails', async () => {
    // Mock fetch para simular error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<MockForumList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
