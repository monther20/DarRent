import { formatDate } from '../../lib/utils';

describe('formatDate', () => {
  it('should format a valid date string correctly', () => {
    const dateString = '2024-05-26T10:00:00.000Z';
    expect(formatDate(dateString)).toBe('May 26, 2024');
  });

  it('should handle another valid date string', () => {
    const dateString = '2023-01-15T12:30:00.000Z';
    expect(formatDate(dateString)).toBe('January 15, 2023');
  });

  it('should return "Invalid Date" for an invalid date string', () => {
    const dateString = 'not-a-date';
    // Depending on the system's locale, the output for an invalid date might vary.
    // For consistency in tests, it's often better to check if the input to toLocaleDateString was invalid.
    // However, for this example, we'll stick to checking the direct output.
    // Consider a more robust check if this test becomes flaky across different environments.
    expect(formatDate(dateString)).toBe('Invalid Date');
  });

  it('should format a date at the beginning of a year', () => {
    const dateString = '2025-01-01T00:00:00.000Z';
    expect(formatDate(dateString)).toBe('January 1, 2025');
  });

  it('should format a date at the end of a year', () => {
    const dateString = '2022-12-31T23:59:59.000Z';
    expect(formatDate(dateString)).toBe('December 31, 2022');
  });
});