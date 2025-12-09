
import { describe, it, expect } from 'vitest';
import { RiskProfileSchema } from '../src';

describe('Shared Types: RiskProfile', () => {
    it('should validate a correct risk profile', () => {
        const valid = {
            address: '0x123',
            riskScore: 50,
            lastUpdated: new Date()
        };
        const result = RiskProfileSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it('should reject invalid risk scores (>100)', () => {
        const invalid = {
            address: '0x123',
            riskScore: 101, // Invalid
            lastUpdated: new Date()
        };
        const result = RiskProfileSchema.safeParse(invalid);
        expect(result.success).toBe(false);
    });
});
