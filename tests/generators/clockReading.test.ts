import { describe, it, expect } from 'vitest';
import { generateOfflineClockReading } from '../../src/services/offlineGenerators/clockReading';

describe('ClockReading Generator', () => {
    it('generates correct number of items', async () => {
        const result = await generateOfflineClockReading({
            worksheetCount: 1,
            difficulty: 'Orta',
            itemCount: 15
        } as any);
        expect(result[0].clocks).toHaveLength(15);
    });

    it('supports different precisions', async () => {
        const result = await generateOfflineClockReading({
            worksheetCount: 1,
            difficulty: 'Orta',
            precision: 'hour'
        } as any);
        result[0].clocks.forEach(c => {
            expect(c.minute).toBe(0);
        });
    });

    it('generates valid Turkish verbal time', async () => {
        const result = await generateOfflineClockReading({
            worksheetCount: 1,
            difficulty: 'Orta',
            precision: '15-min'
        } as any);
        
        const quarterPass = result[0].clocks.find(c => c.minute === 15);
        if (quarterPass) {
            expect(quarterPass.verbalTime).toContain('çeyrek geçiyor');
        }

        const quarterTo = result[0].clocks.find(c => c.minute === 45);
        if (quarterTo) {
            expect(quarterTo.verbalTime).toContain('çeyrek var');
        }
    });
});
