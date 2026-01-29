import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContactSection, ContactOptionCard } from './ContactSection';
import type { Contact, ContactOption } from '@/types/content';

// Sample contact data for testing
const sampleContact: Contact = {
  headline: "Let's Connect",
  subtext: "I'd love to hear from you if this resonates. No pressure—reach out whenever feels right.",
  options: [
    {
      type: 'email',
      label: 'Send an email',
      url: 'mailto:hello@example.com',
      description: "Drop me a line and I'll get back to you soon",
    },
    {
      type: 'linkedin',
      label: 'Connect on LinkedIn',
      url: 'https://linkedin.com/in/example',
      description: "Let's grow our professional networks together",
    },
    {
      type: 'calendar',
      label: 'Book a chat',
      url: 'https://calendly.com/example',
      description: 'Schedule a time that works for you',
    },
  ],
};

describe('ContactSection', () => {
  /**
   * Validates: Requirement 8.1
   * THE Content_Architecture SHALL include a Contact section accessible from the Navigation_System
   */
  it('renders the contact section with proper id for navigation', () => {
    render(<ContactSection contact={sampleContact} />);
    
    const section = document.getElementById('contact');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  /**
   * Validates: Requirement 8.4
   * THE Contact engagement paths SHALL use inviting language
   */
  it('renders inviting headline and subtext', () => {
    render(<ContactSection contact={sampleContact} />);
    
    expect(screen.getByRole('heading', { name: "Let's Connect" })).toBeInTheDocument();
    expect(screen.getByText(/I'd love to hear from you/)).toBeInTheDocument();
  });

  /**
   * Validates: Requirement 8.2
   * THE Contact section SHALL provide multiple engagement options (email, LinkedIn, calendar booking)
   */
  it('renders multiple contact options', () => {
    render(<ContactSection contact={sampleContact} />);
    
    expect(screen.getByText('Send an email')).toBeInTheDocument();
    expect(screen.getByText('Connect on LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Book a chat')).toBeInTheDocument();
  });

  it('renders contact option descriptions', () => {
    render(<ContactSection contact={sampleContact} />);
    
    expect(screen.getByText(/Drop me a line/)).toBeInTheDocument();
    expect(screen.getByText(/grow our professional networks/)).toBeInTheDocument();
    expect(screen.getByText(/Schedule a time/)).toBeInTheDocument();
  });

  it('renders with proper heading hierarchy', () => {
    render(<ContactSection contact={sampleContact} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('id', 'contact-heading');
  });

  it('renders with aria-labelledby for accessibility', () => {
    render(<ContactSection contact={sampleContact} />);
    
    const section = document.getElementById('contact');
    expect(section).toHaveAttribute('aria-labelledby', 'contact-heading');
  });

  it('renders default headline when none provided', () => {
    const contactWithoutHeadline: Contact = {
      ...sampleContact,
      headline: '',
    };
    
    render(<ContactSection contact={contactWithoutHeadline} />);
    
    expect(screen.getByRole('heading', { name: 'Get in Touch' })).toBeInTheDocument();
  });

  it('renders empty state when no options provided', () => {
    const contactWithoutOptions: Contact = {
      ...sampleContact,
      options: [],
    };
    
    render(<ContactSection contact={contactWithoutOptions} />);
    
    expect(screen.getByText('Contact options coming soon.')).toBeInTheDocument();
  });

  it('renders soft closing message', () => {
    // Use contact without the phrase in subtext to avoid duplicate matches
    const contactWithDifferentSubtext: Contact = {
      ...sampleContact,
      subtext: "I'd love to hear from you if this resonates.",
    };
    
    render(<ContactSection contact={contactWithDifferentSubtext} />);
    
    // The closing message should be rendered
    expect(screen.getByText(/No pressure—reach out whenever feels right/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ContactSection contact={sampleContact} className="custom-class" />);
    
    const section = document.getElementById('contact');
    expect(section).toHaveClass('custom-class');
  });
});

describe('ContactOptionCard', () => {
  const emailOption: ContactOption = {
    type: 'email',
    label: 'Send an email',
    url: 'mailto:hello@example.com',
    description: "Drop me a line and I'll get back to you soon",
  };

  const linkedinOption: ContactOption = {
    type: 'linkedin',
    label: 'Connect on LinkedIn',
    url: 'https://linkedin.com/in/example',
    description: "Let's grow our professional networks together",
  };

  const calendarOption: ContactOption = {
    type: 'calendar',
    label: 'Book a chat',
    url: 'https://calendly.com/example',
    description: 'Schedule a time that works for you',
  };

  const formOption: ContactOption = {
    type: 'form',
    label: 'Fill out a form',
    url: '/contact-form',
    description: 'Send me a detailed message',
  };

  it('renders email option with correct href', () => {
    render(<ContactOptionCard option={emailOption} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'mailto:hello@example.com');
    // Email links should not open in new tab
    expect(link).not.toHaveAttribute('target');
  });

  it('renders LinkedIn option with external link attributes', () => {
    render(<ContactOptionCard option={linkedinOption} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders calendar option with external link attributes', () => {
    render(<ContactOptionCard option={calendarOption} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://calendly.com/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders form option without external link attributes', () => {
    render(<ContactOptionCard option={formOption} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/contact-form');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders label and description', () => {
    render(<ContactOptionCard option={emailOption} />);
    
    expect(screen.getByText('Send an email')).toBeInTheDocument();
    expect(screen.getByText(/Drop me a line/)).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(<ContactOptionCard option={emailOption} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      "Send an email: Drop me a line and I'll get back to you soon"
    );
  });

  it('applies custom className', () => {
    render(<ContactOptionCard option={emailOption} className="custom-class" />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-class');
  });

  it('renders all contact option types', () => {
    const { rerender } = render(<ContactOptionCard option={emailOption} />);
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(<ContactOptionCard option={linkedinOption} />);
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(<ContactOptionCard option={calendarOption} />);
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(<ContactOptionCard option={formOption} />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
