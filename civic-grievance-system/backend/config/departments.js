export const DEPARTMENTS = Object.freeze([
  { value: 'road_service', name: 'Roads & Infrastructure Department', categories: ['pothole'] },
  { value: 'electrical', name: 'Electricity Department', categories: ['electrical', 'streetlight'] },
  { value: 'municipality', name: 'Waste Management & Municipality Department', categories: ['garbage'] },
  { value: 'water_leakage', name: 'Water Supply Department', categories: ['water'] }
]);

export function getDepartment(value) {
  return DEPARTMENTS.find((department) => department.value === value);
}

export function isValidDepartment(value) {
  return Boolean(getDepartment(value));
}