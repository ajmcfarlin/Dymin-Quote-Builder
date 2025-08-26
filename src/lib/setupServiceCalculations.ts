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
      return 33.99 + (0.5 * (customer.infrastructure.workstations || 0))

    case 'onprem-server-onboarding':
      // =IF(E10=TRUE,9.15,0)
      return 9.15

    case 'azure-virtual-server':
      // =IF(E11=TRUE,13.4,0)
      return 13.4

    case 'intune-onboarding':
      // =IF(E12=TRUE,12.66+(0.22*Intro!F26),0)
      // F26 = workstations
      return 12.66 + (0.22 * (customer.infrastructure.workstations || 0))

    case 'voip-onboarding':
      // =IF(E13=TRUE,11.99+(0.11*Intro!F32),0)
      // F32 = phone extensions
      return 11.99 + (0.11 * (customer.infrastructure.phoneExtensions || 0))

    case 'voip-sms-addon':
      // =IF(E14=TRUE,5.75,0)
      return 5.75

    case 'email-migration':
      // =IF(E15=TRUE,4.85,0)
      return 4.85

    case 'office-relocation':
      // =IF(E16=TRUE,12.5,0)
      return 12.5

    case 'inky-email-security':
      // =IF(E17=TRUE,0.75,0)
      return 0.75

    case 'duo-mfa':
      // =IF(E18=TRUE,2,0)
      return 2

    case 'infima-cyber-training':
      // =IF(E19=TRUE,0.75,0)
      return 0.75

    case 'lob-app-migration':
      // =IF(E20=TRUE,2.5,0)
      return 2.5

    default:
      return 0
  }
}