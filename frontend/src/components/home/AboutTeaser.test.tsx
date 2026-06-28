import { render, screen } from '@testing-library/react';
import { AboutTeaser } from './AboutTeaser';

describe('AboutTeaser', () => {
  it('links to the about page', () => {
    render(<AboutTeaser />);
    expect(screen.getByRole('link', { name: /Mehr über mich/ })).toHaveAttribute('href', '/about');
  });
});
