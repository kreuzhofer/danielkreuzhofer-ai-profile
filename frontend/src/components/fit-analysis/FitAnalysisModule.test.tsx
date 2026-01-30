/**
 * FitAnalysisModule Component Tests
 *
 * Tests for the main module component including mobile layout.
 *
 * @see Requirements 1.1, 8.1
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FitAnalysisModule } from './FitAnalysisModule';
import { FitAnalysisProvider } from '@/context/FitAnalysisContext';

// Mock sessionStorage
const mockStorage: Record<string, string> = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => mockStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    }),
  },
  writable: true,
});

describe('FitAnalysisModule', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  const renderModule = () => {
    return render(
      <FitAnalysisProvider>
        <FitAnalysisModule />
      </FitAnalysisProvider>
    );
  };

  describe('rendering', () => {
    it('renders the module container', () => {
      renderModule();
      expect(screen.getByTestId('fit-analysis-module')).toBeInTheDocument();
    });

    it('renders intro section', () => {
      renderModule();
      expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    });

    it('renders input section initially', () => {
      renderModule();
      expect(screen.getByTestId('job-description-textarea')).toBeInTheDocument();
    });

    it('renders history panel', () => {
      renderModule();
      expect(screen.getByTestId('history-panel')).toBeInTheDocument();
    });
  });

  describe('mobile layout', () => {
    it('has max-width constraint for readability', () => {
      renderModule();
      const module = screen.getByTestId('fit-analysis-module');
      expect(module).toHaveClass('max-w-4xl');
    });

    it('has horizontal padding for mobile', () => {
      renderModule();
      const module = screen.getByTestId('fit-analysis-module');
      expect(module).toHaveClass('px-4');
    });

    it('has vertical padding', () => {
      renderModule();
      const module = screen.getByTestId('fit-analysis-module');
      expect(module).toHaveClass('py-8');
    });

    it('centers content horizontally', () => {
      renderModule();
      const module = screen.getByTestId('fit-analysis-module');
      expect(module).toHaveClass('mx-auto');
    });
  });

  describe('accessibility', () => {
    it('has proper structure with sections', () => {
      renderModule();

      // Should have intro section
      expect(screen.getByTestId('intro-section')).toBeInTheDocument();

      // Should have form for input
      expect(screen.getByTestId('input-section-form')).toBeInTheDocument();
    });
  });
});
