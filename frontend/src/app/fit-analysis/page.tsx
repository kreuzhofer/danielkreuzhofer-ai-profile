/**
 * Fit Analysis Page
 *
 * Page component for the Automated Fit Analysis Module.
 * Wraps the FitAnalysisModule with the FitAnalysisProvider.
 *
 * @see Requirement 1.1
 */

import { Metadata } from 'next';
import { FitAnalysisProvider } from '@/context/FitAnalysisContext';
import { FitAnalysisModule } from '@/components/fit-analysis/FitAnalysisModule';

export const metadata: Metadata = {
  title: 'Fit Analysis | Portfolio',
  description:
    'Get an honest, AI-powered assessment of how well your job description aligns with my experience. Includes strengths, gaps, and transparent recommendations.',
  openGraph: {
    title: 'Fit Analysis | Portfolio',
    description:
      'Get an honest, AI-powered assessment of how well your job description aligns with my experience.',
    type: 'website',
  },
};

export default function FitAnalysisPage() {
  return (
    <FitAnalysisProvider>
      <main className="min-h-screen bg-white">
        <FitAnalysisModule />
      </main>
    </FitAnalysisProvider>
  );
}
