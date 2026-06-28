import { render, screen } from '@testing-library/react';
import { ChatProvider } from '@/context/ChatContext';
import AboutPage from './page';

describe('AboutPage (re-homed profile)', () => {
  it('renders the profile and the "Was ich gebaut habe" demos linking to both tools', () => {
    render(
      <ChatProvider>
        <AboutPage />
      </ChatProvider>
    );
    expect(screen.getByRole('link', { name: /Skills Transparency|Transparenz/ })).toHaveAttribute('href', '/transparency');
    expect(screen.getByRole('link', { name: /Fit.?Analys/i })).toHaveAttribute('href', '/fit-analysis');
  });
});
