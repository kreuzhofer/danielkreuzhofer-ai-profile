'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { PostPreviewCard } from './PostPreviewCard';
import type { BlogPost } from '@/types/content';

interface AnimatedBlogCardProps {
  post: BlogPost;
  index: number;
}

export function AnimatedBlogCard({ post, index }: AnimatedBlogCardProps) {
  const { ref, animationStyle } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      style={{
        ...animationStyle,
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <PostPreviewCard post={post} />
    </div>
  );
}
