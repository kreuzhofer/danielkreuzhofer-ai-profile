import { render, screen } from '@testing-library/react';
import { CoachingPointer } from './CoachingPointer';

describe('CoachingPointer', () => {
  it('softly points warm leads to the coaching offer', () => {
    render(<CoachingPointer />);
    expect(screen.getByRole('link', { name: /Coaching ansehen/ })).toHaveAttribute('href', '/coaching');
  });
});
