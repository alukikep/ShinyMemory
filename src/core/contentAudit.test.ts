import { describe, expect, it } from 'vitest';
import { auditContent } from './contentAudit';

describe('content audit', () => {
  it('has no broken references or rule violations', () => {
    const issues = auditContent();
    const errors = issues.filter((issue) => issue.level === 'error');
    expect(errors).toEqual([]);
  });

  it('has no warnings in the active pack', () => {
    expect(auditContent()).toEqual([]);
  });
});
