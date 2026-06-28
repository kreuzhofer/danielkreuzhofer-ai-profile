import { render, screen } from '@testing-library/react';
import { MethodTimeline } from './MethodTimeline';

describe('MethodTimeline', () => {
  it('renders the system name and subline', () => {
    render(<MethodTimeline />);
    expect(screen.getByRole('heading', { name: /Smart AI Wins System/ })).toBeInTheDocument();
    expect(screen.getByText(/Bremsen lösen\. Pilot planen\. Impact liefern\./)).toBeInTheDocument();
  });

  it('renders all four phases with their week labels', () => {
    render(<MethodTimeline />);
    expect(screen.getByText('Kickoff & Analyse')).toBeInTheDocument();
    expect(screen.getByText('Impact Review')).toBeInTheDocument();
    expect(screen.getByText('Woche 1')).toBeInTheDocument();
    expect(screen.getByText('Woche 11–12')).toBeInTheDocument();
  });
});
