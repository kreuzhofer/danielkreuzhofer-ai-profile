/**
 * Fit Analysis Validation Utility Tests
 *
 * Unit tests for the validateJobDescription function covering edge cases
 * including boundary conditions, whitespace handling, and validation messages.
 *
 * @see Requirements 2.3, 2.4, 1.3
 */

import { validateJobDescription } from './fit-analysis-validation';
import { JOB_DESCRIPTION_CONSTRAINTS } from '@/types/fit-analysis';

describe('validateJobDescription', () => {
  describe('empty and whitespace-only input (Requirement 2.3)', () => {
    it('should return isValid: false with error for empty string', () => {
      const result = validateJobDescription('');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please enter a job description to analyze.'
      );
      expect(result.warningMessage).toBeNull();
    });

    it('should return isValid: false with error for whitespace-only string (spaces)', () => {
      const result = validateJobDescription('     ');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please enter a job description to analyze.'
      );
      expect(result.warningMessage).toBeNull();
    });

    it('should return isValid: false with error for whitespace-only string (tabs)', () => {
      const result = validateJobDescription('\t\t\t');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please enter a job description to analyze.'
      );
      expect(result.warningMessage).toBeNull();
    });

    it('should return isValid: false with error for whitespace-only string (newlines)', () => {
      const result = validateJobDescription('\n\n\n');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please enter a job description to analyze.'
      );
      expect(result.warningMessage).toBeNull();
    });

    it('should return isValid: false for mixed whitespace (tabs, newlines, spaces)', () => {
      const result = validateJobDescription('  \t\n  \r\n  \t  ');

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'Please enter a job description to analyze.'
      );
      expect(result.warningMessage).toBeNull();
    });
  });

  describe('short input warning (Requirement 2.4)', () => {
    it('should return isValid: true with warning for 1-49 character input', () => {
      const shortInput = 'Short job description';
      expect(shortInput.length).toBeLessThan(50);

      const result = validateJobDescription(shortInput);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBe(
        'Adding more detail may improve analysis quality.'
      );
    });

    it('should return isValid: true with warning for single character input', () => {
      const result = validateJobDescription('a');

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBe(
        'Adding more detail may improve analysis quality.'
      );
    });

    it('should return isValid: true with warning for 49 character input', () => {
      const input49Chars = 'a'.repeat(49);
      expect(input49Chars.length).toBe(49);

      const result = validateJobDescription(input49Chars);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBe(
        'Adding more detail may improve analysis quality.'
      );
    });
  });

  describe('boundary: exactly 50 characters (Requirement 2.4)', () => {
    it('should return isValid: true with NO warning for exactly 50 characters', () => {
      const input50Chars = 'a'.repeat(50);
      expect(input50Chars.length).toBe(50);

      const result = validateJobDescription(input50Chars);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });
  });

  describe('valid input above minimum (Requirements 2.4, 1.3)', () => {
    it('should return isValid: true with no warning for 51+ characters up to 10000', () => {
      const input100Chars = 'a'.repeat(100);
      expect(input100Chars.length).toBe(100);

      const result = validateJobDescription(input100Chars);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });

    it('should return isValid: true for typical job description length', () => {
      const typicalJobDescription =
        'We are looking for a Senior Software Engineer with 5+ years of experience in TypeScript, React, and Node.js. The ideal candidate will have strong problem-solving skills and experience with cloud platforms.';

      const result = validateJobDescription(typicalJobDescription);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });
  });

  describe('boundary: exactly 10000 characters (Requirement 1.3)', () => {
    it('should return isValid: true for exactly 10000 characters', () => {
      const input10000Chars = 'a'.repeat(10000);
      expect(input10000Chars.length).toBe(10000);

      const result = validateJobDescription(input10000Chars);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });
  });

  describe('exceeds maximum length (Requirement 1.3)', () => {
    it('should return isValid: false with error for 10001+ characters', () => {
      const input10001Chars = 'a'.repeat(10001);
      expect(input10001Chars.length).toBe(10001);

      const result = validateJobDescription(input10001Chars);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        `Job description exceeds maximum length of ${JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH.toLocaleString()} characters.`
      );
      expect(result.warningMessage).toBeNull();
    });

    it('should return isValid: false for significantly over maximum', () => {
      const input20000Chars = 'a'.repeat(20000);

      const result = validateJobDescription(input20000Chars);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        `Job description exceeds maximum length of ${JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH.toLocaleString()} characters.`
      );
      expect(result.warningMessage).toBeNull();
    });
  });

  describe('whitespace trimming behavior', () => {
    it('should trim leading whitespace before validation', () => {
      const inputWithLeadingSpaces = '   ' + 'a'.repeat(50);
      expect(inputWithLeadingSpaces.trim().length).toBe(50);

      const result = validateJobDescription(inputWithLeadingSpaces);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });

    it('should trim trailing whitespace before validation', () => {
      const inputWithTrailingSpaces = 'a'.repeat(50) + '   ';
      expect(inputWithTrailingSpaces.trim().length).toBe(50);

      const result = validateJobDescription(inputWithTrailingSpaces);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });

    it('should trim both leading and trailing whitespace before validation', () => {
      const inputWithBothSpaces = '   ' + 'a'.repeat(50) + '   ';
      expect(inputWithBothSpaces.trim().length).toBe(50);

      const result = validateJobDescription(inputWithBothSpaces);

      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.warningMessage).toBeNull();
    });

    it('should show warning when trimmed content is under 50 chars', () => {
      const inputWithSpaces = '   short text   ';
      expect(inputWithSpaces.trim().length).toBeLessThan(50);

      const result = validateJobDescription(inputWithSpaces);

      expect(result.isValid).toBe(true);
      expect(result.warningMessage).toBe(
        'Adding more detail may improve analysis quality.'
      );
    });

    it('should reject when trimmed content exceeds max length', () => {
      const inputOverMax = '  ' + 'a'.repeat(10001) + '  ';
      expect(inputOverMax.trim().length).toBe(10001);

      const result = validateJobDescription(inputOverMax);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        `Job description exceeds maximum length of ${JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH.toLocaleString()} characters.`
      );
    });
  });

  describe('constraint values verification', () => {
    it('should use correct MAX_LENGTH constraint value', () => {
      expect(JOB_DESCRIPTION_CONSTRAINTS.MAX_LENGTH).toBe(10000);
    });

    it('should use correct MIN_LENGTH_WARNING constraint value', () => {
      expect(JOB_DESCRIPTION_CONSTRAINTS.MIN_LENGTH_WARNING).toBe(50);
    });
  });
});
