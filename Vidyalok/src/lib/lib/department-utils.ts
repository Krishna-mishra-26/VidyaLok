import { CANONICAL_DEPARTMENTS, type CanonicalDepartment } from '@/constants/departments'

const FALLBACK_DEPARTMENT: CanonicalDepartment = 'H & AS'

export const sanitizeDepartmentKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')

const departmentSynonyms: Record<string, CanonicalDepartment> = {
  aiml: 'Artificial Intelligence & Machine Learning',
  articialinteeligence: 'Artificial Intelligence & Machine Learning',
  artificialinteelience: 'Artificial Intelligence & Machine Learning',
  artificialinteeligence: 'Artificial Intelligence & Machine Learning',
  artificialintelligence: 'Artificial Intelligence & Machine Learning',
  artificialintelligencemachinelearning: 'Artificial Intelligence & Machine Learning',
  compengineering: 'Computer Engineering',
  compitengineering: 'Computer Engineering',
  compitengineeringmaths: 'Computer Engineering',
  computer: 'Computer Engineering',
  computerengg: 'Computer Engineering',
  computerenggit: 'Computer Engineering',
  computerenggitengg: 'Computer Engineering',
  computerengineering: 'Computer Engineering',
  cs: 'Computer Engineering',
  computerscienceinformationtechnology: 'Information Technology',
  informationtech: 'Information Technology',
  informationtechnology: 'Information Technology',
  informationtecnology: 'Information Technology',
  it: 'Information Technology',
  itengg: 'Information Technology',
  civil: 'Civil',
  civilengg: 'Civil',
  civilengineeing: 'Civil',
  civilengineerimg: 'Civil',
  civilengineering: 'Civil',
  civilemgineering: 'Civil',
  communicationskills: 'H & AS',
  chemistry: 'H & AS',
  chemstry: 'H & AS',
  dadascience: 'Data Science',
  datascience: 'Data Science',
  datascienceartificialintelligence: 'Data Science',
  electronicsandtelecommunications: 'EXTC',
  evs: 'H & AS',
  ex: 'EXTC',
  extc: 'EXTC',
  extcengg: 'EXTC',
  extcengineering: 'EXTC',
  exte: 'EXTC',
  frenchlanguage: 'H & AS',
  general: 'H & AS',
  genral: 'H & AS',
  genralhas: 'H & AS',
  germanlanguage: 'H & AS',
  has: 'H & AS',
  haschemistry: 'H & AS',
  hascs: 'H & AS',
  hasevs: 'H & AS',
  hasgen: 'H & AS',
  hasjapanese: 'H & AS',
  haslaw: 'H & AS',
  haslibsci: 'H & AS',
  hasmanagement: 'H & AS',
  hasmaths: 'H & AS',
  hasmathematics: 'H & AS',
  hasmgmt: 'H & AS',
  hasphysics: 'H & AS',
  japaneselanguage: 'H & AS',
  management: 'H & AS',
  mathematics: 'H & AS',
  maths: 'H & AS',
  mecg: 'Mechanical',
  mech: 'Mechanical',
  mechcivilautomobile: 'Mechanical',
  mechcivilautomobileetc: 'Mechanical',
  mechengineering: 'Mechanical',
  mechanicalengg: 'Mechanical',
  mechanicalengineering: 'Mechanical',
  mechnicalengineering: 'Mechanical',
  meths: 'H & AS',
  mrvh: 'H & AS',
  pct: 'H & AS',
  phy: 'H & AS',
  physics: 'H & AS',
  spanishlanguage: 'H & AS'
}

const departmentPatternRules: Array<{ pattern: RegExp; department: CanonicalDepartment }> = [
  { pattern: /(aiml|artificial|machinelearning)/, department: 'Artificial Intelligence & Machine Learning' },
  { pattern: /datascience/, department: 'Data Science' },
  { pattern: /computer|comp(?!lete)/, department: 'Computer Engineering' },
  { pattern: /informationtech|\bit\b/, department: 'Information Technology' },
  { pattern: /civil/, department: 'Civil' },
  { pattern: /mech|automobile/, department: 'Mechanical' },
  { pattern: /extc|electronicsandtelecommunication|^ex$/, department: 'EXTC' },
  {
    pattern: /has|math|chem|evs|communication|language|general|management|physics|pct|mrvh|phy/,
    department: 'H & AS'
  }
]

export const resolveDepartment = (rawDepartment: string | null | undefined): CanonicalDepartment => {
  const trimmed = (rawDepartment ?? '').trim()
  if (!trimmed) {
    return FALLBACK_DEPARTMENT
  }

  const key = sanitizeDepartmentKey(trimmed)

  if (key && departmentSynonyms[key as keyof typeof departmentSynonyms]) {
    return departmentSynonyms[key as keyof typeof departmentSynonyms]
  }

  for (const { pattern, department } of departmentPatternRules) {
    if (pattern.test(key)) {
      return department
    }
  }

  return FALLBACK_DEPARTMENT
}

export const canonicalizeDepartmentList = (values: Iterable<string>) => {
  const resolved = new Set<CanonicalDepartment>()

  for (const value of values) {
    resolved.add(resolveDepartment(value))
  }

  return CANONICAL_DEPARTMENTS.filter((dept) => resolved.has(dept))
}

export const toDepartmentFilterOptions = (values: Iterable<string | null | undefined>) => [
  'all',
  ...canonicalizeDepartmentList(Array.from(values).filter((value): value is string => Boolean(value)))
] as const

export { FALLBACK_DEPARTMENT }
