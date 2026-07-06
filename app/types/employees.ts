export interface EmployeeSummary {
  id: string
  name: string
  email?: string | null
  role?: string
}

export interface EmployeeDetail extends EmployeeSummary {
  meetings: import('./meetings').Meeting[]
  projects: import('./projects').Project[]
}

export interface EmployeeOption {
  id: string
  name: string
}
