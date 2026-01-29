import React from 'react';
import { render, screen } from '@testing-library/react';
import { AboutSection, SocialLinks } from './AboutSection';
import type { About, SocialLink } from '@/types/content';

/**
 * Unit tests for AboutSection component
 * 
 * **Validates: Requirement 2.5**
 * - 2.5: THE Summary_Layer for About SHALL display a professional headline, brief bio (under 100 words), and primary value proposition
 */

describe('AboutSection', () => {
  // Sample about data for testing
  const sampleAbout: About = {
    headline: 'Full-Stack Software Engineer',
    bio: 'I am a passionate software engineer with experience building web applications. I specialize in React and TypeScript.',
    valueProposition: 'I help companies build scalable solutions.',
    profileImage: '',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/test', label: 'LinkedIn' },
      { platform: 'github', url: 'https://github.com/test', label: 'GitHub' },
    ],
  };

  describe('rendering', () => {
    it('renders the section with correct id for anchor navigation', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const section = document.getElementById('about');
      expect(section).toBeInTheDocument();
      expect(section?.tagName).toBe('SECTION');
    });

    it('renders the section heading with proper accessibility', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const heading = screen.getByRole('heading', { name: /about/i, level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute('id', 'about-heading');
    });

    it('renders the professional headline', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const headline = screen.getByRole('heading', { name: sampleAbout.headline, level: 3 });
      expect(headline).toBeInTheDocument();
    });

    it('renders the bio text', () => {
      render(<AboutSection about={sampleAbout} />);
      
      expect(screen.getByText(sampleAbout.bio)).toBeInTheDocument();
    });

    it('renders the value proposition', () => {
      render(<AboutSection about={sampleAbout} />);
      
      expect(screen.getByText(sampleAbout.valueProposition)).toBeInTheDocument();
    });

    it('renders social links', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
      const githubLink = screen.getByRole('link', { name: /github/i });
      
      expect(linkedInLink).toBeInTheDocument();
      expect(githubLink).toBeInTheDocument();
    });
  });

  describe('bio under 100 words', () => {
    it('displays bio correctly when under 100 words', () => {
      const shortBio = 'This is a short bio with only a few words.';
      const aboutWithShortBio: About = {
        ...sampleAbout,
        bio: shortBio,
      };
      
      render(<AboutSection about={aboutWithShortBio} />);
      
      expect(screen.getByText(shortBio)).toBeInTheDocument();
    });

    it('displays bio correctly at exactly 100 words', () => {
      // Generate exactly 100 words
      const words = Array(100).fill('word').join(' ');
      const aboutWith100Words: About = {
        ...sampleAbout,
        bio: words,
      };
      
      render(<AboutSection about={aboutWith100Words} />);
      
      expect(screen.getByText(words)).toBeInTheDocument();
    });
  });

  describe('optional content', () => {
    it('renders without profile image when not provided', () => {
      const aboutWithoutImage: About = {
        ...sampleAbout,
        profileImage: undefined,
      };
      
      render(<AboutSection about={aboutWithoutImage} />);
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders profile image when provided', () => {
      const aboutWithImage: About = {
        ...sampleAbout,
        profileImage: '/images/profile.jpg',
      };
      
      render(<AboutSection about={aboutWithImage} />);
      
      const img = screen.getByRole('img', { name: /profile/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/images/profile.jpg');
    });

    it('renders without social links when empty array', () => {
      const aboutWithoutLinks: About = {
        ...sampleAbout,
        socialLinks: [],
      };
      
      render(<AboutSection about={aboutWithoutLinks} />);
      
      // Should not have any social link elements
      expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
    });

    it('handles missing headline gracefully', () => {
      const aboutWithoutHeadline: About = {
        ...sampleAbout,
        headline: '',
      };
      
      render(<AboutSection about={aboutWithoutHeadline} />);
      
      // Section should still render
      expect(document.getElementById('about')).toBeInTheDocument();
      // But no h3 headline
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });

    it('handles missing bio gracefully', () => {
      const aboutWithoutBio: About = {
        ...sampleAbout,
        bio: '',
      };
      
      render(<AboutSection about={aboutWithoutBio} />);
      
      // Section should still render
      expect(document.getElementById('about')).toBeInTheDocument();
    });

    it('handles missing value proposition gracefully', () => {
      const aboutWithoutValue: About = {
        ...sampleAbout,
        valueProposition: '',
      };
      
      render(<AboutSection about={aboutWithoutValue} />);
      
      // Section should still render
      expect(document.getElementById('about')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper aria-labelledby on section', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const section = document.getElementById('about');
      expect(section).toHaveAttribute('aria-labelledby', 'about-heading');
    });

    it('social links have accessible labels', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
      expect(linkedInLink).toHaveAttribute('aria-label');
    });

    it('social links open in new tab with proper rel attributes', () => {
      render(<AboutSection about={sampleAbout} />);
      
      const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('email links do not open in new tab', () => {
      const aboutWithEmail: About = {
        ...sampleAbout,
        socialLinks: [
          { platform: 'email', url: 'mailto:test@example.com', label: 'Email me' },
        ],
      };
      
      render(<AboutSection about={aboutWithEmail} />);
      
      const emailLink = screen.getByRole('link', { name: /email/i });
      expect(emailLink).not.toHaveAttribute('target');
    });
  });

  describe('custom className', () => {
    it('applies custom className to section', () => {
      render(<AboutSection about={sampleAbout} className="custom-class" />);
      
      const section = document.getElementById('about');
      expect(section).toHaveClass('custom-class');
    });
  });
});

describe('SocialLinks', () => {
  const sampleLinks: SocialLink[] = [
    { platform: 'linkedin', url: 'https://linkedin.com/in/test', label: 'LinkedIn Profile' },
    { platform: 'github', url: 'https://github.com/test', label: 'GitHub Profile' },
    { platform: 'twitter', url: 'https://twitter.com/test', label: 'Twitter Profile' },
    { platform: 'email', url: 'mailto:test@example.com', label: 'Send Email' },
  ];

  it('renders all social link platforms', () => {
    render(<SocialLinks links={sampleLinks} />);
    
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument();
  });

  it('renders nothing when links array is empty', () => {
    const { container } = render(<SocialLinks links={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when links is undefined', () => {
    const { container } = render(<SocialLinks links={undefined as unknown as SocialLink[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<SocialLinks links={sampleLinks} className="custom-social" />);
    
    expect(container.firstChild).toHaveClass('custom-social');
  });

  it('links have minimum touch target size', () => {
    render(<SocialLinks links={sampleLinks} />);
    
    const link = screen.getByRole('link', { name: /linkedin/i });
    expect(link).toHaveClass('min-w-[44px]');
    expect(link).toHaveClass('min-h-[44px]');
  });
});
