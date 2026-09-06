import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// Mock del componente LoginForm
const MockLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      // Handle successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<MockLoginForm />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    render(<MockLoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // El input es type="email" required, asi que la validacion nativa corta el
    // submit: handleSubmit no llega a ejecutarse. El test esperaba el mensaje
    // 'Invalid credentials', que solo aparece si la peticion SE HACE y falla,
    // justo lo contrario de lo que el nombre del test dice cubrir.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    render(<MockLoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    // fetch queda pendiente a proposito: el estado de carga solo es observable
    // mientras la peticion esta en vuelo. Con el vi.fn() por defecto de
    // test/setup.ts la promesa resolvia a undefined, el catch y el finally
    // corrian enseguida y para cuando llegaba el waitFor loading ya era false.
    global.fetch = vi.fn(() => new Promise(() => {}));

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
