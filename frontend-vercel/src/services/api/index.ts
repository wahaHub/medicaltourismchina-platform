// Central API service aggregator
import { departmentApi } from './department';
import { diseaseApi } from './disease';
import { procedureApi } from './procedure';
import { hospitalApi } from './hospital';
import { featuredTreatmentApi } from './featured-treatment';
import * as caseIntakesApi from './caseIntakes';
import * as salesTokensApi from './salesTokens';

// Export all API modules
export * from './config';
export * from './department';
export * from './disease';
export * from './procedure';
export * from './hospital';
export * from './featured-treatment';
export * from './caseIntakes';
export * from './salesTokens';

// Aggregate all API services for backward compatibility
export const apiService = {
  // Department APIs
  getDept: departmentApi.getDept,
  getDepartmentCapability: departmentApi.getDepartmentCapability,
  
  // Disease APIs
  getDiseasesByDepartment: diseaseApi.getDiseasesByDepartment,
  getDiseaseDetail: diseaseApi.getDiseaseDetail,
  
  // Procedure APIs
  getProceduresByDisease: procedureApi.getProceduresByDisease,
  getProcedures: procedureApi.getProcedures,
  getProcedureDetail: procedureApi.getProcedureDetail,
  
  // Hospital APIs (new)
  getHospitals: hospitalApi.getHospitals,
  getHospitalBySlug: hospitalApi.getHospitalBySlug,
  getHospitalPackageDetailBySlug: hospitalApi.getHospitalPackageDetailBySlug,
  searchHospitals: hospitalApi.searchHospitals,
  getHospitalsByCity: hospitalApi.getHospitalsByCity,
  
  // Featured Treatment APIs
  getFeaturedTreatments: featuredTreatmentApi.getFeaturedTreatments,
  getFeaturedTreatmentBySlug: featuredTreatmentApi.getFeaturedTreatmentBySlug,
  getFeaturedTreatmentsByType: featuredTreatmentApi.getFeaturedTreatmentsByType,
  trackFeaturedTreatment: featuredTreatmentApi.trackFeaturedTreatment,

  // Case Intake APIs
  getCaseIntakes: caseIntakesApi.getCaseIntakes,
  getCurrentCaseIntake: caseIntakesApi.getCurrentCaseIntake,
  getCaseIntakeById: caseIntakesApi.getCaseIntakeById,
  createCaseIntake: caseIntakesApi.createCaseIntake,
  updateCaseIntake: caseIntakesApi.updateCaseIntake,
  deleteCaseIntake: caseIntakesApi.deleteCaseIntake,

  // Sales Token APIs
  generateSalesToken: salesTokensApi.generateSalesToken,
  validateSalesToken: salesTokensApi.validateSalesToken,
  useSalesToken: salesTokensApi.useSalesToken,
  getSalesTokens: salesTokensApi.getSalesTokens,
  deactivateSalesToken: salesTokensApi.deactivateSalesToken,
  buildShareUrl: salesTokensApi.buildShareUrl,
};

export default apiService;
