import { render, screen } from '@testing-library/react';
import { ProofStrip } from './ProofStrip';

describe('ProofStrip', () => {
  it('renders the authority heading and all proof points', () => {
    render(<ProofStrip />);
    expect(screen.getByRole('heading', { name: /KI-Piloten/ })).toBeInTheDocument();
    expect(screen.getByText(/25\+ Jahre/)).toBeInTheDocument();
  });

  it('links to the about page', () => {
    render(<ProofStrip />);
    expect(screen.getByRole('link', { name: /Mehr über mich/ })).toHaveAttribute('href', '/about');
  });
});
