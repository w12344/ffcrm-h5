import { getColorByCompletion, calculateForecast, filterWhipWarnings } from '../../utils/ceoUtils';

describe('CEO Dashboard Utils', () => {
  describe('getColorByCompletion', () => {
    it('returns purple for A grade (>= 110%)', () => {
      expect(getColorByCompletion(115)).toBe('#722ED1');
      expect(getColorByCompletion(110)).toBe('#722ED1');
    });
    
    it('returns green for B grade (90-109%)', () => {
      expect(getColorByCompletion(100)).toBe('#52C41A');
      expect(getColorByCompletion(90)).toBe('#52C41A');
    });
    
    it('returns orange for C grade (60-89%)', () => {
      expect(getColorByCompletion(75)).toBe('#FAAD14');
      expect(getColorByCompletion(60)).toBe('#FAAD14');
    });
    
    it('returns red for D grade (< 60%)', () => {
      expect(getColorByCompletion(50)).toBe('#F5222D');
      expect(getColorByCompletion(0)).toBe('#F5222D');
    });
  });

  describe('calculateForecast', () => {
    it('calculates min and max within reasonable bounds', () => {
      const result = calculateForecast(100, 0.1);
      expect(result.min).toBeLessThan(result.max);
      expect(result.min).toBe(8.5);
      expect(result.max).toBe(11.5);
    });
  });

  describe('filterWhipWarnings', () => {
    it('filters employees correctly based on warning criteria', () => {
      const employees = [
        { id: 1, consecutiveDDays: 8, activeCustomers: 10, connectionRate: 0.5 }, // trigger rule 1
        { id: 2, consecutiveDDays: 0, activeCustomers: 3, connectionRate: 0.5 },  // trigger rule 2
        { id: 3, consecutiveDDays: 0, activeCustomers: 10, connectionRate: 0.2 }, // trigger rule 3
        { id: 4, consecutiveDDays: 0, activeCustomers: 10, connectionRate: 0.5 }, // safe
      ];
      
      const result = filterWhipWarnings(employees);
      expect(result.length).toBe(3);
      expect(result.map(r => r.id)).toEqual([1, 2, 3]);
    });
  });
});
