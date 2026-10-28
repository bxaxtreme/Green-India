const paths: Record<string, string> = {
  leaf: '<path d="M20 4c-7 0-13 3-13 10a6 6 0 0 0 6 6c7 0 10-6 7-16Z"/><path d="M4 21c2-5 6-8 12-11"/>',
  arrow: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  camera: '<path d="M14 5l1.5 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4.5L10 5Z"/><circle cx="12" cy="13" r="3.5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  drop: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/>',
  recycle: '<path d="m7 7 2-3 4 0M17 17l2-3-2-4M7 17l-4-1 2-4"/><path d="m9 4 3 5M19 14l-6 0M5 12l3 5"/>'
};
export function icon(name: string, size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.leaf}</svg>`;
}