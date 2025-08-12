import { SetupService } from '@/types/quote'
import { CustomerInfo } from '@/types/quote'

export function calculateSetupServiceHours(
  serviceId: string,
  isActive: boolean,
  customer: CustomerInfo
): number {
  if (!isActive) return 0

  switch (serviceId) {
    case 'consulting-services':
      // =IF(E7=TRUE,3.23,0)
      return 3.23

    case 'project-management':
      // =IF(E8=TRUE,3.07,0)
      return 3.07

    case 'standard-onboarding':
      // Example: =IF(E9=TRUE,33.99+(0.5*Intro!F26),0)
      // F26 = workstations
      return 33.99 + (0.5 * customer.infrastructure.workstations)

    case 'onprem-server-onboarding':
      // =IF(E10=TRUE,9.15,0)
      return 9.15

    case 'azure-virtual-server':
      // =IF(E11=TRUE,13.4,0)
      return 13.4

    case 'intune-onboarding':
      // =IF(E12=TRUE,12.66+(0.22*Intro!F26),0)
      // F26 = workstations
      return 12.66 + (0.22 * customer.infrastructure.workstations)

    case 'voip-onboarding':
      // Placeholder - need actual formula
      return 6

    case 'voip-sms-addon':
      // Placeholder - need actual formula
      return 1

    case 'email-migration':
      // Placeholder - need actual formula
      return 8

    case 'office-relocation':
      // Placeholder - need actual formula
      return 12

    case 'inky-email-security':
      // Placeholder - need actual formula
      return 2

    case 'duo-mfa':
      // Placeholder - need actual formula
      return 2

    case 'infima-cyber-training':
      // Placeholder - need actual formula
      return 3

    case 'lob-app-migration':
      // Placeholder - need actual formula
      return 16

    default:
      return 0
  }
}