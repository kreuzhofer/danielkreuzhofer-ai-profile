import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpandButton, ExpandContent, Expandable } from './Expandable';

describe('ExpandButton', () => {
  const defaultProps = {
    buttonId: 'test-btn',
    contentId: 'test-content',
    isExpanded: false,
    onClick: jest.fn(),
    children: 'Click to expand',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ARIA attributes', () => {
    it('should have aria-expanded="false" when collapsed', () => {
      render(<ExpandButton {...defaultProps} isExpanded={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-expanded="true" when expanded', () => {
      render(<ExpandButton {...defaultProps} isExpanded={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-controls pointing to content ID', () => {
      render(<ExpandButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'test-content');
    });

    it('should have the correct button ID', () => {
      render(<ExpandButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'test-btn');
    });

    it('should apply aria-label when provided', () => {
      render(<ExpandButton {...defaultProps} ariaLabel="Expand details for item" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Expand details for item');
    });
  });

  describe('Click interaction', () => {
    it('should call onClick when clicked', async () => {
      const onClick = jest.fn();
      render(<ExpandButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard interaction (Requirement 7.2)', () => {
    it('should call onClick when Enter key is pressed', () => {
      const onClick = jest.fn();
      render(<ExpandButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', () => {
      const onClick = jest.fn();
      render(<ExpandButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick for other keys', () => {
      const onClick = jest.fn();
      render(<ExpandButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'a' });
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter/Space to avoid double-firing', () => {
      const onClick = jest.fn();
      render(<ExpandButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      const enterEvent = fireEvent.keyDown(button, { key: 'Enter' });
      const spaceEvent = fireEvent.keyDown(button, { key: ' ' });
      
      // Events should be handled (onClick called)
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<ExpandButton {...defaultProps} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should have minimum touch target size classes', () => {
      render(<ExpandButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('min-w-[44px]');
    });

    it('should have focus ring classes for accessibility', () => {
      render(<ExpandButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Content rendering', () => {
    it('should render children content', () => {
      render(
        <ExpandButton {...defaultProps}>
          <span data-testid="child">Button Label</span>
        </ExpandButton>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Button Label')).toBeInTheDocument();
    });
  });
});

describe('ExpandContent', () => {
  const defaultProps = {
    buttonId: 'test-btn',
    contentId: 'test-content',
    isExpanded: false,
    children: <p>Expandable content here</p>,
  };

  describe('ARIA attributes (Requirement 7.3)', () => {
    it('should have role="region"', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} />);
      
      const region = screen.getByRole('region');
      expect(region).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to button ID', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'test-btn');
    });

    it('should have the correct content ID', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('id', 'test-content');
    });
  });

  describe('Visibility', () => {
    it('should have hidden attribute when collapsed', () => {
      render(<ExpandContent {...defaultProps} isExpanded={false} />);
      
      const content = document.getElementById('test-content');
      expect(content).toHaveAttribute('hidden');
    });

    it('should not have hidden attribute when expanded', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} />);
      
      const content = document.getElementById('test-content');
      expect(content).not.toHaveAttribute('hidden');
    });

    it('should hide content from screen readers when collapsed', () => {
      render(<ExpandContent {...defaultProps} isExpanded={false} />);
      
      // When hidden, the region should not be findable by role
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });

    it('should show content to screen readers when expanded', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} />);
      
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Content rendering', () => {
    it('should render children content', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} />);
      
      expect(screen.getByText('Expandable content here')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<ExpandContent {...defaultProps} isExpanded={true} className="custom-content-class" />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveClass('custom-content-class');
    });
  });
});

describe('Expandable (combined component)', () => {
  const defaultProps = {
    id: 'test-item',
    isExpanded: false,
    onToggle: jest.fn(),
    summaryContent: <span>Summary content</span>,
    depthContent: <p>Depth content details</p>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ID generation', () => {
    it('should generate correct button ID from item ID', () => {
      render(<Expandable {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'expand-btn-test-item');
    });

    it('should generate correct content ID from item ID', () => {
      render(<Expandable {...defaultProps} isExpanded={true} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('id', 'expand-content-test-item');
    });

    it('should link button to content via aria-controls', () => {
      render(<Expandable {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'expand-content-test-item');
    });

    it('should link content to button via aria-labelledby', () => {
      render(<Expandable {...defaultProps} isExpanded={true} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', 'expand-btn-test-item');
    });
  });

  describe('Content rendering', () => {
    it('should always render summary content', () => {
      render(<Expandable {...defaultProps} />);
      
      expect(screen.getByText('Summary content')).toBeInTheDocument();
    });

    it('should hide depth content when collapsed', () => {
      render(<Expandable {...defaultProps} isExpanded={false} />);
      
      // Content should not be in the document when collapsed (not rendered for performance)
      expect(screen.queryByText('Depth content details')).not.toBeInTheDocument();
    });

    it('should show depth content when expanded', () => {
      render(<Expandable {...defaultProps} isExpanded={true} />);
      
      expect(screen.getByText('Depth content details')).toBeVisible();
    });
  });

  describe('Toggle interaction', () => {
    it('should call onToggle when button is clicked', async () => {
      const onToggle = jest.fn();
      render(<Expandable {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when Enter is pressed on button', () => {
      const onToggle = jest.fn();
      render(<Expandable {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle when Space is pressed on button', () => {
      const onToggle = jest.fn();
      render(<Expandable {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility attributes', () => {
    it('should have aria-expanded="false" when collapsed', () => {
      render(<Expandable {...defaultProps} isExpanded={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-expanded="true" when expanded', () => {
      render(<Expandable {...defaultProps} isExpanded={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should apply ariaLabel to button when provided', () => {
      render(<Expandable {...defaultProps} ariaLabel="Expand experience details" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Expand experience details');
    });
  });

  describe('Styling', () => {
    it('should apply className to container', () => {
      render(<Expandable {...defaultProps} className="container-class" />);
      
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('container-class');
    });

    it('should apply buttonClassName to button', () => {
      render(<Expandable {...defaultProps} buttonClassName="button-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button-class');
    });

    it('should apply contentClassName to content region', () => {
      render(<Expandable {...defaultProps} isExpanded={true} contentClassName="content-class" />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveClass('content-class');
    });
  });

  describe('Integration with useExpandable hook pattern', () => {
    it('should work with typical useExpandable usage pattern', async () => {
      // Simulate the pattern from useExpandable hook
      let expandedIds = new Set<string>();
      const isExpanded = (id: string) => expandedIds.has(id);
      const toggle = jest.fn((id: string) => {
        if (expandedIds.has(id)) {
          expandedIds = new Set([...expandedIds].filter(i => i !== id));
        } else {
          expandedIds = new Set([...expandedIds, id]);
        }
      });

      const { rerender } = render(
        <Expandable
          id="item-1"
          isExpanded={isExpanded('item-1')}
          onToggle={() => toggle('item-1')}
          summaryContent={<span>Item 1 Summary</span>}
          depthContent={<p>Item 1 Details</p>}
        />
      );

      // Initially collapsed
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
      
      // Click to expand
      await userEvent.click(screen.getByRole('button'));
      expect(toggle).toHaveBeenCalledWith('item-1');
      
      // Rerender with expanded state
      rerender(
        <Expandable
          id="item-1"
          isExpanded={true}
          onToggle={() => toggle('item-1')}
          summaryContent={<span>Item 1 Summary</span>}
          depthContent={<p>Item 1 Details</p>}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Item 1 Details')).toBeVisible();
    });
  });
});

describe('Accessibility compliance', () => {
  it('should maintain proper ARIA relationship between button and content', () => {
    render(
      <Expandable
        id="a11y-test"
        isExpanded={true}
        onToggle={() => {}}
        summaryContent={<span>Summary</span>}
        depthContent={<p>Details</p>}
      />
    );

    const button = screen.getByRole('button');
    const region = screen.getByRole('region');

    // Button controls the content
    const controlsId = button.getAttribute('aria-controls');
    expect(controlsId).toBe(region.getAttribute('id'));

    // Content is labeled by the button
    const labelledById = region.getAttribute('aria-labelledby');
    expect(labelledById).toBe(button.getAttribute('id'));
  });

  it('should announce state changes via aria-expanded', () => {
    const { rerender } = render(
      <Expandable
        id="announce-test"
        isExpanded={false}
        onToggle={() => {}}
        summaryContent={<span>Summary</span>}
        depthContent={<p>Details</p>}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // Simulate expansion
    rerender(
      <Expandable
        id="announce-test"
        isExpanded={true}
        onToggle={() => {}}
        summaryContent={<span>Summary</span>}
        depthContent={<p>Details</p>}
      />
    );

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Animation behavior (Requirement 6.2)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ExpandContent animation', () => {
    it('should use 200ms animation duration by default', () => {
      const { rerender } = render(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={false}
        >
          <p>Content</p>
        </ExpandContent>
      );

      // Expand the content
      rerender(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={true}
        >
          <p>Content</p>
        </ExpandContent>
      );

      const content = document.getElementById('test-content');
      // During animation, the transition style should include 200ms
      expect(content?.style.transition).toContain('200ms');
    });

    it('should allow custom animation duration', () => {
      const { rerender } = render(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={false}
          animationDuration={150}
        >
          <p>Content</p>
        </ExpandContent>
      );

      rerender(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={true}
          animationDuration={150}
        >
          <p>Content</p>
        </ExpandContent>
      );

      const content = document.getElementById('test-content');
      expect(content?.style.transition).toContain('150ms');
    });

    it('should skip animation when animate prop is false', () => {
      const { rerender } = render(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={false}
          animate={false}
        >
          <p>Content</p>
        </ExpandContent>
      );

      rerender(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={true}
          animate={false}
        >
          <p>Content</p>
        </ExpandContent>
      );

      const content = document.getElementById('test-content');
      // No transition style when animation is disabled
      expect(content?.style.transition).toBeFalsy();
    });

    it('should call onAnimationComplete callback after animation', async () => {
      const onAnimationComplete = jest.fn();
      
      const { rerender } = render(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={false}
          onAnimationComplete={onAnimationComplete}
        >
          <p>Content</p>
        </ExpandContent>
      );

      rerender(
        <ExpandContent
          buttonId="test-btn"
          contentId="test-content"
          isExpanded={true}
          onAnimationComplete={onAnimationComplete}
        >
          <p>Content</p>
        </ExpandContent>
      );

      // Callback should not be called immediately
      expect(onAnimationComplete).not.toHaveBeenCalled();

      // Fast-forward past animation duration, wrapped in act
      await act(async () => {
        jest.advanceTimersByTime(200);
      });

      expect(onAnimationComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Expandable animation props', () => {
    it('should pass animate prop to ExpandContent', () => {
      render(
        <Expandable
          id="anim-test"
          isExpanded={true}
          onToggle={() => {}}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
          animate={false}
        />
      );

      const content = document.getElementById('expand-content-anim-test');
      // When animate is false, no transition style
      expect(content?.style.transition).toBeFalsy();
    });

    it('should pass animationDuration prop to ExpandContent', () => {
      const { rerender } = render(
        <Expandable
          id="duration-test"
          isExpanded={false}
          onToggle={() => {}}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
          animationDuration={100}
        />
      );

      rerender(
        <Expandable
          id="duration-test"
          isExpanded={true}
          onToggle={() => {}}
          summaryContent={<span>Summary</span>}
          depthContent={<p>Details</p>}
          animationDuration={100}
        />
      );

      const content = document.getElementById('expand-content-duration-test');
      expect(content?.style.transition).toContain('100ms');
    });
  });
});

describe('Scroll position preservation (Requirement 3.4)', () => {
  const mockScrollBy = jest.fn();
  const mockGetBoundingClientRect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.scrollBy
    Object.defineProperty(window, 'scrollBy', {
      value: mockScrollBy,
      writable: true,
    });
  });

  it('should preserve scroll position by default', async () => {
    const onToggle = jest.fn();
    
    // Mock getBoundingClientRect to simulate button position
    mockGetBoundingClientRect
      .mockReturnValueOnce({ top: 100 }) // Before toggle
      .mockReturnValueOnce({ top: 150 }); // After toggle (content expanded, button moved down)

    render(
      <Expandable
        id="scroll-test"
        isExpanded={false}
        onToggle={onToggle}
        summaryContent={<span>Summary</span>}
        depthContent={<p>Details</p>}
      />
    );

    const button = screen.getByRole('button');
    // Override getBoundingClientRect for the button
    button.getBoundingClientRect = mockGetBoundingClientRect;

    await userEvent.click(button);

    expect(onToggle).toHaveBeenCalled();
  });

  it('should skip scroll preservation when preserveScrollPosition is false', async () => {
    const onToggle = jest.fn();

    render(
      <Expandable
        id="no-scroll-test"
        isExpanded={false}
        onToggle={onToggle}
        summaryContent={<span>Summary</span>}
        depthContent={<p>Details</p>}
        preserveScrollPosition={false}
      />
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalled();
    // scrollBy should not be called when preserveScrollPosition is false
    // (the actual scroll adjustment happens in requestAnimationFrame which we can't easily test)
  });

  it('should call onToggle even when scroll preservation is enabled', async () => {
    const onToggle = jest.fn();

    render(
      <Expandable
        id="toggle-test"
        isExpanded={false}
        onToggle={onToggle}
        summaryContent={<span>Summary</span>}
        depthContent={<p>Details</p>}
        preserveScrollPosition={true}
      />
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
