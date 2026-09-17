export function generateAiSummary({ category, address, affectedCitizens = 1 }) {
  const detectedProblem = category === 'other' ? 'Civic issue' : category.charAt(0).toUpperCase() + category.slice(1);
  const location = address || 'the reported GPS location';
  return `${detectedProblem} reported near ${location}, affecting ${affectedCitizens} citizen${affectedCitizens === 1 ? '' : 's'} in this area.`;
}
