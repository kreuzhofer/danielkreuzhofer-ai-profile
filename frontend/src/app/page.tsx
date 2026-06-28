import { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import {
  CoachingHero,
  ProofStrip,
  LandingSection,
  MethodTimeline,
  InvestmentCard,
  FaqSection,
  LeadMagnetsSection,
  FinalCtaSection,
  coachingContent,
} from '@/components/coaching';

export const metadata: Metadata = {
  title: '90-Tage AI Win — KI-Coaching mit Kante | Daniel Kreuzhofer',
  description:
    'Done-With-You-Coaching für Bereichsleiter im Mittelstand: in 90 Tagen einen risikoarmen, messbaren KI-Pilot planen, umsetzen und beweisen.',
  openGraph: {
    title: '90-Tage AI Win — KI-Coaching mit Kante',
    description:
      'In 90 Tagen einen risikoarmen, messbaren KI-Pilot planen, umsetzen und beweisen. Done-With-You für Bereichsleiter mit KI-Mandat.',
    type: 'website',
  },
};

/**
 * Home = coaching sales landing for the 90-Tage AI Win offer (Stufe 2).
 * Profile content now lives at /about.
 */
export default function Home() {
  const { forWhom, problem, result } = coachingContent;
  return (
    <Layout>
      <CoachingHero />
      <ProofStrip />
      <LandingSection id="for-whom" {...forWhom} />
      <LandingSection id="problem" {...problem} />
      <MethodTimeline />
      <LandingSection id="result" {...result} />
      <InvestmentCard />
      <FaqSection />
      <LeadMagnetsSection />
      <FinalCtaSection />
    </Layout>
  );
}
