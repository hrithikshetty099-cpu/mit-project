const rules = [
  ['pothole', ['pothole', 'road', 'pavement']], ['streetlight', ['streetlight', 'street light', 'lamp']],
  ['garbage', ['garbage', 'waste', 'trash', 'dump']], ['water', ['leak', 'water', 'pipe']],
  ['electrical', ['electrical', 'wire', 'power', 'transformer']]
];
export function classifyComplaint(description = '') {
  const text = description.toLowerCase();
  const match = rules.find(([, words]) => words.some((word) => text.includes(word)));
  return match ? { category: match[0], confidence: 0.9 } : { category: 'other', confidence: 0.35 };
}