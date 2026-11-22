export const models = ['NEMO Global', 'HYCOM', 'ROMS Regional'] as const;
export const regions = ['North Atlantic', 'Mediterranean', 'Global Ocean'] as const;
export const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4'] as const;
export const metrics = ['RMSE', 'Bias', 'Correlation', 'Skill Score'] as const;
export type Metric = typeof metrics[number];
export type Section = 'Overview' | 'Class 1–4 Validation' | 'Model Intercomparison' | 'Lagrangian Analysis' | 'Eddy Tracking' | 'Ocean Dynamics Diagnostics';
export const sections: Section[] = ['Overview', 'Class 1–4 Validation', 'Model Intercomparison', 'Lagrangian Analysis', 'Eddy Tracking', 'Ocean Dynamics Diagnostics'];
export const variables = ['Sea surface height', 'Sea surface temperature', 'Currents', 'Salinity'];
export const demoSeries = (model: string, metric: string, seed = 0) => {
  const offset = models.indexOf(model) * 0.11 + seed * 0.07;
  const dates = Array.from({length: 32}, (_, i) => new Date(Date.UTC(2026, 8, 1 + i * 2)).toISOString().slice(0, 10));
  return { x: dates, y: dates.map((_, i) => {
    const oscillation = Math.sin(i * 0.49 + offset * 6) * 0.10 + Math.cos(i * 0.23 + offset) * 0.05;
    if (metric === 'Correlation') return +(0.83 - offset * 0.35 + oscillation / 2).toFixed(3);
    if (metric === 'Skill Score') return +(0.75 - offset * 0.36 + oscillation / 2).toFixed(3);
    if (metric === 'Bias') return +(0.08 + offset + oscillation).toFixed(3);
    return +(0.31 + offset + oscillation).toFixed(3);
  }) };
};
export const score = (model: string, metric: string) => {
  const values = demoSeries(model, metric).y;
  return values.reduce((a,b) => a+b,0) / values.length;
};
export const drifters = [
  { name: 'Drifter A', color: '#2dd4bf', coordinates: [[-62, 35],[-58,36],[-54,37.5],[-50,39],[-46,40],[-42,42]] },
  { name: 'Drifter B', color: '#fbbf24', coordinates: [[-69,32],[-65,34],[-62,36],[-58,38],[-54,40],[-50,41]] },
  { name: 'Drifter C', color: '#a78bfa', coordinates: [[-53,31],[-50,33],[-47,35],[-45,37],[-41,38],[-38,40]] },
];
export const eddies = [
  { id: 'E-101', center: [-54, 38], radius: 95000, kind: 'Anticyclonic', lifetime: 42 },
  { id: 'E-102', center: [-44, 33], radius: 67000, kind: 'Cyclonic', lifetime: 26 },
  { id: 'E-103', center: [-62, 41], radius: 81000, kind: 'Anticyclonic', lifetime: 58 },
];
