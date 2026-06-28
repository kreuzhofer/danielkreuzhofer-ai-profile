import { render, screen } from '@testing-library/react';
import { BlogTeaser } from './BlogTeaser';

const posts = [
  { title: 'Erster Artikel', excerpt: 'Auszug eins', slug: 'erster' },
  { title: 'Zweiter Artikel', excerpt: 'Auszug zwei', slug: 'zweiter' },
];

describe('BlogTeaser', () => {
  it('renders the given posts linking to their slug + an all-articles link', () => {
    render(<BlogTeaser posts={posts} />);
    expect(screen.getByRole('link', { name: /Erster Artikel/ })).toHaveAttribute('href', '/blog/erster');
    expect(screen.getByRole('link', { name: /Alle Artikel/ })).toHaveAttribute('href', '/blog');
  });

  it('renders nothing when there are no posts', () => {
    const { container } = render(<BlogTeaser posts={[]} />);
    expect(container.querySelector('section')).toBeNull();
  });
});
