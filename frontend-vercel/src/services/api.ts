// Legacy API service file - redirects to new modular structure
// This file is kept for backward compatibility

// Re-export everything from the new modular structure
export * from './api/index';
export { apiService, apiService as default } from './api/index';

// Re-export all types for backward compatibility
export type {
  ApiResponse,
  Department,
  DepartmentCapability,
  Disease,
  DiseaseDetail,
  SimpleProcedure,
  ProcedureCard,
  ProcedureDetail,
  CenterCard,
  CenterDetail,
  DashboardData,
  UserProfile,
} from '@/types';