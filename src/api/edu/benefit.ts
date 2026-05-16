import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";
import type { EduImportResultData } from "./student";

export interface EduBenefitProductItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  code: string;
  benefitType: string;
  calculationMode: string;
  totalCount?: number;
  validDays?: number;
  status?: number;
  remark?: string;
  courseScope?: number[];
}

export interface EduBenefitProductListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  name?: string;
  code?: string;
  benefitType?: string;
  calculationMode?: string;
  status?: number;
}

export type EduBenefitProductAddParams = Omit<EduBenefitProductItem, "id" | "createdAt" | "updatedAt" | "courseScope">;

export interface EduBenefitProductUpdateParams extends EduBenefitProductAddParams {
  id: number;
}

export interface EduStudentBenefitItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  studentId: number;
  productId?: number;
  benefitType: string;
  calculationMode: string;
  courseId: number;
  classId?: number;
  teacherId?: number;
  validFrom?: string | null;
  validTo?: string | null;
  totalCount?: number;
  usedCount?: number;
  remainingCount?: number;
  status?: number;
  sourceType?: string;
}

export interface EduStudentBenefitListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  studentId?: number;
  productId?: number;
  benefitType?: string;
  calculationMode?: string;
  courseId?: number;
  classId?: number;
  teacherId?: number;
  status?: number;
}

export type EduStudentBenefitAddParams = Omit<EduStudentBenefitItem, "id" | "createdAt" | "updatedAt">;

export interface EduStudentBenefitUpdateParams extends EduStudentBenefitAddParams {
  id: number;
}

export interface EduBenefitLedgerItem {
  id: number;
  studentBenefitId: number;
  studentId: number;
  actionType: string;
  bizType: string;
  bizId?: number;
  changeCount?: number;
  beforeCount?: number;
  afterCount?: number;
  occurredAt?: string | null;
  operatorId?: number;
  remark?: string;
}

export interface EduBenefitLedgerListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  studentBenefitId?: number;
  studentId?: number;
  actionType?: string;
  bizType?: string;
}

export interface EduBenefitExternalSyncItem {
  id: number;
  studentBenefitId: number;
  studentId: number;
  providerCode: string;
  idempotencyKey?: string;
  status: string;
  retryCount?: number;
  reason?: string;
}

export interface EduBenefitExternalSyncListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  studentBenefitId?: number;
  studentId?: number;
  providerCode?: string;
  idempotencyKey?: string;
  status?: string;
}

export type EduBenefitProductListResult = BaseResult<{ list: EduBenefitProductItem[]; total: number }>;
export type EduBenefitProductOptionsResult = BaseResult<{ list: EduBenefitProductItem[] }>;
export type EduStudentBenefitListResult = BaseResult<{ list: EduStudentBenefitItem[]; total: number }>;
export type EduBenefitLedgerListResult = BaseResult<{ list: EduBenefitLedgerItem[]; total: number }>;
export type EduBenefitExternalSyncListResult = BaseResult<{ list: EduBenefitExternalSyncItem[]; total: number }>;

export const getEduBenefitProductListAPI = (params?: EduBenefitProductListParams) => {
  return http.request<EduBenefitProductListResult>("get", baseUrlApi("edu/benefit-products/list"), { params });
};

export const getEduBenefitProductOptionsAPI = () => {
  return http.request<EduBenefitProductOptionsResult>("get", baseUrlApi("edu/benefit-products/options"));
};

export const addEduBenefitProductAPI = (data: EduBenefitProductAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/benefit-products/add"), { data });
};

export const editEduBenefitProductAPI = (data: EduBenefitProductUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/benefit-products/edit"), { data });
};

export const deleteEduBenefitProductAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/benefit-products/delete"), { data });
};

export const getEduStudentBenefitListAPI = (params?: EduStudentBenefitListParams) => {
  return http.request<EduStudentBenefitListResult>("get", baseUrlApi("edu/student-benefits/list"), { params });
};

export const addEduStudentBenefitAPI = (data: EduStudentBenefitAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/student-benefits/add"), { data });
};

export const editEduStudentBenefitAPI = (data: EduStudentBenefitUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/student-benefits/edit"), { data });
};

export const checkEduStudentBenefitAPI = (data: { studentId: number; courseId: number; classId?: number; teacherId?: number }) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/student-benefits/check"), { data });
};

export const repairEduStudentBenefitScheduleAPI = (data: { studentId?: number; courseId?: number; effectiveFrom?: string }) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/student-benefits/repair-schedule"), { data });
};

export const getEduBenefitLedgerListAPI = (params?: EduBenefitLedgerListParams) => {
  return http.request<EduBenefitLedgerListResult>("get", baseUrlApi("edu/benefit-ledgers/list"), { params });
};

export const getEduBenefitExternalSyncListAPI = (params?: EduBenefitExternalSyncListParams) => {
  return http.request<EduBenefitExternalSyncListResult>("get", baseUrlApi("edu/benefit-external-sync/list"), { params });
};

export const retryEduBenefitExternalSyncAPI = (data: { id: number }) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/benefit-external-sync/retry"), { data });
};

export type EduBenefitImportResult = BaseResult<EduImportResultData>;
