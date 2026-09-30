export const CANONICAL_DEPARTMENTS = [
  'Artificial Intelligence & Machine Learning',
  'Computer Engineering',
  'Information Technology',
  'Civil',
  'Mechanical',
  'EXTC',
  'H & AS',
  'Data Science'
] as const

export type CanonicalDepartment = (typeof CANONICAL_DEPARTMENTS)[number]

export const CANONICAL_DEPARTMENTS_WITH_ALL = ['all', ...CANONICAL_DEPARTMENTS] as const
