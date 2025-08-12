import { SetupService } from '@/types/quote'

export const DEFAULT_SETUP_SERVICES: SetupService[] = [
  {
    id: 'consulting-services',
    name: 'Consulting Services (New Project)',
    isActive: false,
    skillLevel: 2,
    factor1: 'onsite',
    factor2: 'business',
    hours: 8,
    cost: 1000,
    price: 2500
  },
  {
    id: 'project-management',
    name: 'Project Management',
    isActive: false,
    skillLevel: 2,
    factor1: 'remote',
    factor2: 'business',
    hours: 4,
    cost: 500,
    price: 1500
  },
  {
    id: 'standard-onboarding',
    name: 'Standard Onboarding',
    isActive: false,
    skillLevel: 2,
    factor1: 'onsite',
    factor2: 'business',
    hours: 6,
    cost: 300,
    price: 800
  },
  {
    id: 'onprem-server-onboarding',
    name: 'On-Premises Server Onboarding',
    isActive: false,
    skillLevel: 2,
    factor1: 'onsite',
    factor2: 'business',
    hours: 8,
    cost: 400,
    price: 1200
  },
  {
    id: 'azure-virtual-server',
    name: 'Azure Virtual Server Onboarding',
    isActive: false,
    skillLevel: 2,
    factor1: 'remote',
    factor2: 'business',
    hours: 6,
    cost: 350,
    price: 1000
  },
  {
    id: 'intune-onboarding',
    name: 'In-Tune Onboarding',
    isActive: false,
    skillLevel: 2,
    factor1: 'remote',
    factor2: 'business',
    hours: 4,
    cost: 200,
    price: 600
  },
  {
    id: 'voip-onboarding',
    name: 'VoIP Onboarding',
    isActive: false,
    skillLevel: 2,
    factor1: 'onsite',
    factor2: 'business',
    hours: 6,
    cost: 250,
    price: 750
  },
  {
    id: 'voip-sms-addon',
    name: 'VoIP SMS Add-On',
    isActive: false,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    hours: 1,
    cost: 50,
    price: 150
  },
  {
    id: 'email-migration',
    name: 'Email Migration (One-time License Cost/Price INCLUDED)',
    isActive: false,
    skillLevel: 2,
    hours: 8,
    cost: 300,
    price: 900
  },
  {
    id: 'office-relocation',
    name: 'Office Relocation/Expansion',
    isActive: false,
    skillLevel: 2,
    hours: 12,
    cost: 500,
    price: 1500
  },
  {
    id: 'inky-email-security',
    name: 'INKY Email Security Add-On',
    isActive: false,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    hours: 2,
    cost: 100,
    price: 300
  },
  {
    id: 'duo-mfa',
    name: 'Duo MFA Add-On',
    isActive: false,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    hours: 2,
    cost: 75,
    price: 225
  },
  {
    id: 'infima-cyber-training',
    name: 'Infima Cyber Security Training Add-On',
    isActive: false,
    skillLevel: 1,
    factor1: 'remote',
    factor2: 'business',
    hours: 3,
    cost: 150,
    price: 450
  },
  {
    id: 'lob-app-migration',
    name: 'LOB App Migration',
    isActive: false,
    skillLevel: 3,
    factor1: 'onsite',
    factor2: 'business',
    hours: 16,
    cost: 800,
    price: 2400
  }
]