export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY';

export interface Alert {
  id: string;
  organizationId: string;
  title: string;
  severity: AlertSeverity;
  targetArea: string;
  message: string;
  isActive: boolean;
  issuedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertInput {
  title: string;
  severity: AlertSeverity;
  targetArea: string;
  message: string;
}
