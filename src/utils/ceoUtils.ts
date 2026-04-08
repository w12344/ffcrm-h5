export const getColorByCompletion = (completion: number): string => {
  if (completion >= 110) return '#722ED1'; // A
  if (completion >= 90) return '#52C41A'; // B
  if (completion >= 60) return '#FAAD14'; // C
  return '#F5222D'; // D
};

export const calculateForecast = (activeCustomers: number, historicalRate: number): { min: number, max: number } => {
  // Simple mock of Monte Carlo result for unit test demonstration
  const base = activeCustomers * historicalRate;
  return {
    min: Number((base * 0.85).toFixed(2)),
    max: Number((base * 1.15).toFixed(2))
  };
};

export const filterWhipWarnings = (employees: any[]) => {
  return employees.filter(emp => 
    emp.consecutiveDDays >= 7 || 
    emp.activeCustomers < 5 || 
    emp.connectionRate < 0.3
  );
};
