import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuruMascot from '@/components/Suru/SuruMascot';

describe('SuruMascot Component', () => {
  it('should render Suru with default props', () => {
    render(<SuruMascot />);

    const img = screen.getByAltText(/Suru - welcome/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/suru/suru-welcome.svg');
  });

  it('should render Suru with custom pose', () => {
    render(<SuruMascot pose="teacher" />);

    const img = screen.getByAltText(/Suru - teacher/i);
    expect(img).toHaveAttribute('src', '/images/suru/suru-teacher.svg');
  });

  it('should render Suru with correct size', () => {
    render(<SuruMascot size="large" />);

    const img = screen.getByAltText(/Suru - welcome/i);
    expect(img).toHaveAttribute('width', '512');
    expect(img).toHaveAttribute('height', '512');
  });

  it('should render message bubble when message is provided', async () => {
    render(<SuruMascot message="¡Hola! Soy Suru" />);

    // Wait for auto-show animation
    await waitFor(() => {
      expect(screen.getByText('¡Hola! Soy Suru')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should call onInteraction callback when clicked', () => {
    const handleInteraction = vi.fn();
    render(<SuruMascot onInteraction={handleInteraction} />);

    const img = screen.getByAltText(/Suru - welcome/i);
    fireEvent.click(img.closest('div')!);

    expect(handleInteraction).toHaveBeenCalledTimes(1);
  });

  it('should hide message when close button is clicked', async () => {
    render(<SuruMascot message="Test message" />);

    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByLabelText('Cerrar mensaje');
    fireEvent.click(closeButton);

    // Message should disappear
    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  it('should apply animation classes when animated prop is true', () => {
    const { container } = render(<SuruMascot animated />);

    const animatedDiv = container.querySelector('.transition-transform');
    expect(animatedDiv).toBeInTheDocument();
    expect(animatedDiv).toHaveClass('hover:scale-110');
  });

  it('should render all pose types correctly', () => {
    const poses = ['welcome', 'logo', 'teacher', 'explaining', 'error', 'success'];

    poses.forEach(pose => {
      const { unmount } = render(<SuruMascot pose={pose as any} />);
      const img = screen.getByAltText(new RegExp(`Suru - ${pose}`, 'i'));
      expect(img).toHaveAttribute('src', `/images/suru/suru-${pose}.svg`);
      unmount();
    });
  });

  it('should render with loading spinner for loading pose', () => {
    const { container } = render(<SuruMascot pose="loading" animated />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct dimensions for each size', () => {
    const sizes = {
      mini: 64,
      small: 128,
      medium: 256,
      large: 512,
      hero: 1024,
    };

    Object.entries(sizes).forEach(([size, pixels]) => {
      const { unmount } = render(<SuruMascot size={size as any} />);
      const img = screen.getByAltText(/Suru - welcome/i);
      expect(img).toHaveAttribute('width', pixels.toString());
      expect(img).toHaveAttribute('height', pixels.toString());
      unmount();
    });
  });
});
