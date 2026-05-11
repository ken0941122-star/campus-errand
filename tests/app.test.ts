import { describe, it, expect } from 'vitest';
import { formatDeadline, generateId } from '../lib/storage';
import { TASK_CATEGORIES, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../lib/types';

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('formatDeadline', () => {
  it('should return 已過期 for past dates', () => {
    const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    expect(formatDeadline(past)).toBe('已過期');
  });

  it('should return minutes for near future', () => {
    const future = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 minutes
    const result = formatDeadline(future);
    expect(result).toContain('分鐘後');
  });

  it('should return hours for hours in future', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(); // 3 hours
    const result = formatDeadline(future);
    expect(result).toContain('小時');
  });

  it('should return days for far future', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(); // 2 days
    const result = formatDeadline(future);
    expect(result).toContain('天後');
  });
});

describe('TASK_CATEGORIES', () => {
  it('should have 4 categories', () => {
    expect(TASK_CATEGORIES).toHaveLength(4);
  });

  it('should have required fields', () => {
    TASK_CATEGORIES.forEach((cat) => {
      expect(cat.key).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    });
  });

  it('should include food, document, shopping, other', () => {
    const keys = TASK_CATEGORIES.map((c) => c.key);
    expect(keys).toContain('food');
    expect(keys).toContain('document');
    expect(keys).toContain('shopping');
    expect(keys).toContain('other');
  });
});

describe('TASK_STATUS_LABELS', () => {
  it('should have labels for all statuses', () => {
    expect(TASK_STATUS_LABELS.open).toBe('待接單');
    expect(TASK_STATUS_LABELS.accepted).toBe('進行中');
    expect(TASK_STATUS_LABELS.completed).toBe('已完成');
    expect(TASK_STATUS_LABELS.cancelled).toBe('已取消');
  });
});

describe('TASK_STATUS_COLORS', () => {
  it('should have valid hex colors for all statuses', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    expect(TASK_STATUS_COLORS.open).toMatch(hexColorRegex);
    expect(TASK_STATUS_COLORS.accepted).toMatch(hexColorRegex);
    expect(TASK_STATUS_COLORS.completed).toMatch(hexColorRegex);
    expect(TASK_STATUS_COLORS.cancelled).toMatch(hexColorRegex);
  });
});
