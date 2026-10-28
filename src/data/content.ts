import type { IssueReport, IssueCategory } from '../types';

export const categories: IssueCategory[] = [
  'Pothole / road damage', 'River / water pollution', 'Garbage / illegal dumping',
  'Plastic pollution', 'Broken public bin', 'Tree / green space', 'Other'
];

export const tips = [
  { icon: '💧', tag: 'SAVE WATER', title: 'Turn off the tap while brushing', body: 'A small daily habit helps reduce unnecessary water use at home.' },
  { icon: '♻️', tag: 'WASTE SMART', title: 'Separate wet and dry waste', body: 'Keep food scraps separate from clean paper, metal, glass and plastic.' },
  { icon: '🌿', tag: 'GO GREEN', title: 'Carry a reusable bottle', body: 'Make reusables part of your everyday bag to avoid single-use bottles.' },
  { icon: '🌳', tag: 'GROW LOCAL', title: 'Care for a native plant', body: 'Choose a suitable local species and look after it after planting.' }
];

export const demoReports: IssueReport[] = [
  {
    id: 'demo-1', title: 'Large pothole near the market crossing', category: 'Pothole / road damage',
    description: 'A pothole is making it difficult for two-wheelers and pedestrians to pass safely. Please inspect the road.',
    address: 'Near the main market crossing', city: 'Bhopal', state: 'Madhya Pradesh',
    reporterName: 'Green India demo', createdAt: '2026-10-24T09:30:00.000Z',
    status: 'Under review', source: 'demo'
  },
  {
    id: 'demo-2', title: 'Plastic waste beside a local pond', category: 'Garbage / illegal dumping',
    description: 'Plastic wrappers and other litter have collected near the water edge. This is a sample report to demonstrate the layout.',
    address: 'Public pond walking path', city: 'Indore', state: 'Madhya Pradesh',
    reporterName: 'Green India demo', createdAt: '2026-10-22T07:10:00.000Z',
    status: 'Received', source: 'demo'
  },
  {
    id: 'demo-3', title: 'Dark water and litter in a drain flowing to a river', category: 'River / water pollution',
    description: 'Unusual water colour and litter were noticed at this location. Please verify the cause before drawing conclusions.',
    address: 'Near the public bridge', city: 'Jabalpur', state: 'Madhya Pradesh',
    reporterName: 'Green India demo', createdAt: '2026-10-19T11:00:00.000Z',
    status: 'Received', source: 'demo'
  }
];