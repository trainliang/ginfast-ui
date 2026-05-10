import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";

export interface EduImportRowError {
  rowNo: number;
  field?: string;
  reason: string;
}

export interface EduImportResultData {
  total: number;
  successCount: number;
  failedCount: number;
  errors?: EduImportRowError[];
  message?: string;
}

export interface EduStudentContact {
  id?: number;
  studentId?: number;
  relation?: string;
  name: string;
  phone: string;
  isPrimary?: number;
  canPickup?: number;
  remark?: string;
}

export interface EduStudentItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  gender?: string;
  birthday?: string | null;
  phone?: string;
  status?: number;
  avatar?: string;
  school?: string;
  grade?: string;
  schoolClass?: string;
  sourceChannel?: string;
  enrollDate?: string | null;
  healthNote?: string;
  allergyNote?: string;
  emergencyContact?: string;
  pickupNote?: string;
  remark?: string;
  contacts?: EduStudentContact[];
}

export interface EduStudentListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  name?: string;
  gender?: string;
  phone?: string;
  status?: number;
  school?: string;
  grade?: string;
  schoolClass?: string;
  sourceChannel?: string;
  emergencyContact?: string;
}

export type EduStudentAddParams = Omit<EduStudentItem, "id" | "createdAt" | "updatedAt">;

export interface EduStudentUpdateParams extends EduStudentAddParams {
  id: number;
}

export type EduStudentImportRow = Partial<EduStudentAddParams>;
export type EduStudentExportRow = EduStudentItem;

export type EduStudentListResult = BaseResult<{
  list: EduStudentItem[];
  total: number;
}>;

export type EduStudentDetailResult = BaseResult<EduStudentItem>;
export type EduStudentImportResult = BaseResult<EduImportResultData>;
export type EduStudentExportResult = BaseResult<{
  list: EduStudentExportRow[];
}>;

export const getEduStudentListAPI = (params?: EduStudentListParams) => {
  return http.request<EduStudentListResult>("get", baseUrlApi("edu/students/list"), { params });
};

export const getEduStudentDetailAPI = (id: number) => {
  return http.request<EduStudentDetailResult>("get", baseUrlApi(`edu/students/${id}`));
};

export const addEduStudentAPI = (data: EduStudentAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/students/add"), { data });
};

export const editEduStudentAPI = (data: EduStudentUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/students/edit"), { data });
};

export const deleteEduStudentAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/students/delete"), { data });
};

export const importEduStudentAPI = (rows: EduStudentImportRow[]) => {
  return http.request<EduStudentImportResult>("post", baseUrlApi("edu/students/import"), {
    data: { rows },
  });
};

export const exportEduStudentAPI = (params?: { ids?: number[] }) => {
  return http.request<EduStudentExportResult>("get", baseUrlApi("edu/students/export"), { params });
};
