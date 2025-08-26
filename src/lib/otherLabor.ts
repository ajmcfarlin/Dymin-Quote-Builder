import { MonthlyLaborService, IncidentBasedService } from '@/types/otherLabor'

export const DEFAULT_MONTHLY_LABOR_SERVICES: MonthlyLaborService[] = [
  {
    id: 'monthly-reports',
    name: 'Monthly Reports to be emailed',
    isActive: false,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    hoursPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  },
  {
    id: 'quarterly-meetings',
    name: 'Quarterly Meetings',
    isActive: false,
    skillLevel: 2,
    factor1: 'onsite',
    factor2: 'business',
    hoursPerMonth: 0.01,
    extendedCost: 0.37,
    extendedPrice: 1.85
  },
  {
    id: 'ncentral-reactive-support',
    name: 'N-central Reactive Support Block',
    isActive: false,
    skillLevel: 2,
    factor1: 'remote',
    factor2: 'business',
    hoursPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  },
  {
    id: 'helpdesk-support-block',
    name: 'Help Desk Support Block',
    isActive: false,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    hoursPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  },
  {
    id: 'admin-time',
    name: 'Admin Time',
    isActive: false,
    skillLevel: 2,
    factor1: 'remote',
    factor2: 'business',
    hoursPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  },
  {
    id: 'project-labor',
    name: 'Project Labor',
    isActive: false,
    skillLevel: 3,
    factor1: 'onsite',
    factor2: 'business',
    hoursPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  },
  {
    id: 'general-emergency-hours',
    name: 'General Emergency Hours',
    isActive: false,
    skillLevel: 3,
    factor1: 'onsite',
    factor2: 'afterhours',
    hoursPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  }
]

export const DEFAULT_INCIDENT_BASED_SERVICES: IncidentBasedService[] = [
  {
    id: 'daytime-helpdesk',
    name: 'Daytime Helpdesk',
    isActive: false,
    hoursPerIncident: 0.33,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    quantityPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  },
  {
    id: 'evening-helpdesk',
    name: 'Evening Helpdesk',
    isActive: false,
    hoursPerIncident: 0.33,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'afterhours',
    quantityPerMonth: 0,
    extendedCost: 0,
    extendedPrice: 0
  }
]