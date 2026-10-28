import type { IssueReport, IssueCategory } from '../types';

export const categories: IssueCategory[] = [
  'Pothole / road damage', 'River / water pollution', 'Garbage / illegal dumping',
  'Plastic pollution', 'Broken public bin', 'Tree / green space', 'Other'
];

export const tips = [
  { icon: '💧', tag: 'SAVE WATER', title: 'Turn off the tap while brushing', body: 'Turn water off while brushing or soaping your hands. Fix dripping taps and report public leaks when you spot them.' },
  { icon: '🌧️', tag: 'RAINWATER', title: 'Collect rainwater where safe', body: 'Ask an adult or building manager about rooftop rainwater harvesting and keep drains clear before the monsoon.' },
  { icon: '🌳', tag: 'PLANT & PROTECT', title: 'Choose a native tree', body: 'Native trees are often better suited to local weather and wildlife. Check the right species and planting space before planting.' },
  { icon: '🪴', tag: 'PLANT CARE', title: 'Help a plant survive', body: 'Water young plants as needed, protect their roots and use mulch to help soil retain moisture. A planted sapling needs care.' },
  { icon: '♻️', tag: 'WASTE SMART', title: 'Separate wet and dry waste', body: 'Keep food scraps apart from clean paper, metal, glass and plastic. Follow your local collection rules.' },
  { icon: '🍂', tag: 'COMPOST', title: 'Turn suitable scraps into compost', body: 'With guidance, compost fruit and vegetable scraps and dry leaves. Keep meat, dairy and oily food out of a simple home pile.' },
  { icon: '🧴', tag: 'LESS PLASTIC', title: 'Carry reusable essentials', body: 'Bring a refillable bottle, lunch box and cloth bag when practical. Reuse what you already own before buying more.' },
  { icon: '⚡', tag: 'SAVE ENERGY', title: 'Switch off what you are not using', body: 'Turn off lights, fans and devices when they are not needed. Use daylight and ventilation when conditions allow.' },
  { icon: '🚲', tag: 'CLEANER TRAVEL', title: 'Walk or cycle for short trips', body: 'When the route is safe and suitable, walking, cycling or sharing a ride can reduce traffic and emissions.' },
  { icon: '🐝', tag: 'WILDLIFE', title: 'Make space for pollinators', body: 'Grow locally suitable flowering plants, avoid disturbing nests and never handle wild animals. Keep water bowls clean and safe.' },
  { icon: '💻', tag: 'E-WASTE', title: 'Dispose of electronics responsibly', body: 'Do not burn or break batteries and electronics. Find an authorised e-waste collection point in your area.' },
  { icon: '🧹', tag: 'CLEAN COMMUNITY', title: 'Keep drains and public spaces clear', body: 'Use bins and report dumping or blocked drains. Never enter drains or polluted water to clean them yourself.' }
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