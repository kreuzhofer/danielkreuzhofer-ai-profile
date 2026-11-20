/**
 * @jest-environment node
 */
import { getExperiences } from './content';
import { PORTFOLIO_OWNER } from './portfolio-owner';
import { experienceFiles } from '../../content/experience/_index';

describe('current position (Nebius since Sep 2026)', () => {
  it('lists Nebius as the first, current experience', () => {
    const [first] = getExperiences();
    expect(first).toMatchObject({
      id: 'nebius',
      role: 'Senior Solutions Architect',
      company: 'Nebius',
      startDate: '2026-09-01',
      endDate: null,
    });
    expect(experienceFiles[0]).toBe('nebius.mdx');
  });

  it('ends the AWS Senior AI Solutions Architect role in August 2026', () => {
    const aws = getExperiences().find((e) => e.id === 'aws-current');
    expect(aws?.endDate).toBe('2026-08-01');
  });

  it('names Nebius as the current employer for chat and fit analysis', () => {
    expect(PORTFOLIO_OWNER.employer).toBe('Nebius');
    expect(PORTFOLIO_OWNER.role).toBe('Senior Solutions Architect');
  });
});
