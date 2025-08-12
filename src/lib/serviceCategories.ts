import { ServiceCategory } from '@/types/quote'

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'maintenance',
    name: 'Maintenance & System Administration',
    hours: { 
      onsiteBusiness: 0.05, 
      remoteBusiness: 0.22, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0.05 
    },
    skillLevel: 1,
    isActive: true
  },
  {
    id: 'helpdesk',
    name: 'Service Desk & Help Desk',
    hours: { 
      onsiteBusiness: 0.05, 
      remoteBusiness: 0.08, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0.05 
    },
    skillLevel: 1,
    isActive: true
  },
  {
    id: 'network',
    name: 'Network Operations',
    hours: { 
      onsiteBusiness: 0.1, 
      remoteBusiness: 0.22, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0.1 
    },
    skillLevel: 2,
    isActive: true
  },
  {
    id: 'security',
    name: 'Security Operations',
    hours: { 
      onsiteBusiness: 0.05, 
      remoteBusiness: 0.15, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0.05 
    },
    skillLevel: 3,
    isActive: true
  },
  {
    id: 'projects',
    name: 'Project Management',
    hours: { 
      onsiteBusiness: 0.02, 
      remoteBusiness: 0.08, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0 
    },
    skillLevel: 2,
    isActive: true
  },
  {
    id: 'backup',
    name: 'Backup & Recovery',
    hours: { 
      onsiteBusiness: 0.02, 
      remoteBusiness: 0.05, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0.02 
    },
    skillLevel: 2,
    isActive: true
  },
  {
    id: 'monitoring',
    name: 'System Monitoring',
    hours: { 
      onsiteBusiness: 0, 
      remoteBusiness: 0.03, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0.02 
    },
    skillLevel: 1,
    isActive: true
  },
  {
    id: 'compliance',
    name: 'Compliance & Documentation',
    hours: { 
      onsiteBusiness: 0.02, 
      remoteBusiness: 0.05, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0 
    },
    skillLevel: 3,
    isActive: true
  },
  {
    id: 'training',
    name: 'User Training & Support',
    hours: { 
      onsiteBusiness: 0.03, 
      remoteBusiness: 0.02, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0 
    },
    skillLevel: 1,
    isActive: false
  },
  {
    id: 'procurement',
    name: 'IT Procurement Support',
    hours: { 
      onsiteBusiness: 0.01, 
      remoteBusiness: 0.02, 
      onsiteAfterHours: 0, 
      remoteAfterHours: 0 
    },
    skillLevel: 2,
    isActive: false
  }
]