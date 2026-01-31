/**
 * Transparency Dashboard Page
 *
 * Page component for the Transparency Dashboard that visualizes expertise
 * across three tiers: Core Strengths, Working Knowledge, and Explicit Gaps.
 *
 * Features:
 * - Three-tier section rendering (Requirement 1.1, 1.2)
 * - Core Strengths section first in document order (Requirement 1.2)
 * - Dashboard intro with title, description, and tier legend (Requirement 10.1, 10.2)
 * - Wrapped in TransparencyDashboardProvider for state management
 * - Server-side data loading from skills.mdx
 *
 * @see Requirements 1.1, 1.2, 10.1, 10.2
 */

import { Metadata } from 'next';
import { TransparencyDashboardProvider } from '@/context/TransparencyDashboardContext';
import { TransparencyDashboard } from './TransparencyDashboard';
import { PageHeader } from '@/components/PageHeader';
import { loadSkills } from '@/lib/transparency-dashboard-loader';

export const metadata: Metadata = {
  title: 'Transparency Dashboard | Daniel Kreuzhofer',
  description:
    'An honest view of my expertise: Core Strengths backed by evidence, Working Knowledge areas, and Explicit Gaps I\'ve chosen not to pursue.',
  openGraph: {
    title: 'Transparency Dashboard | Daniel Kreuzhofer',
    description:
      'An honest view of my expertise: Core Strengths, Working Knowledge, and Explicit Gaps.',
    type: 'website',
  },
};

export default function TransparencyDashboardPage() {
  // Load skills data on the server
  const { skills, gaps } = loadSkills();

  return (
    <TransparencyDashboardProvider initialSkills={skills} initialGaps={gaps}>
      <div className="min-h-screen bg-background">
        <PageHeader />
        <main>
          <TransparencyDashboard />
        </main>
      </div>
    </TransparencyDashboardProvider>
  );
}
