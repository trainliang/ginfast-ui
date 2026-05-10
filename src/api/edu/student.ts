import { http } from "@/utils/http";
import { baseUrlApi } from "../utils";
import { BaseResult } from "../types";

export interface EduStudentContact {
  id?: number;
  name?: string;
  relation?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  remark?: string;
}

export interface EduStudentItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  studentName: string;
  age?: number;
  gender?: string;
  className: string;
  admissionDate: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdBy?: number;
  tenantId?: number;
  contacts?: EduStudentContact[];
  [key: string]: unknown;
}

export interface EduStudentListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  studentName?: string;
  className?: string;
  gender?: string;
  phone?: string;
  email?: string;
  admissionDateStart?: string;
  admissionDateEnd?: string;
}

export interface EduStudentAddParams {
  studentName: string;
  age?: number;
  gender?: string;
  className: string;
  admissionDate: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contacts?: EduStudentContact[];
  [key: string]: unknown;
}

export interface EduStudentUpdateParams extends EduStudentAddParams {
  id: number;
}

export type EduStudentImportRow = Omit<EduStudentAddParams, "contacts"> & {
  contacts?: EduStudentContact[] | string;
};

export type EduStudentExportRow = EduStudentItem;

export type EduStudentListResult = BaseResult<{
  list: EduStudentItem[];
  total: number;
}>;

export type EduStudentDetailResult = BaseResult<EduStudentItem>;

export type EduStudentImportResult = BaseResult<{
  rows: EduStudentImportRow[];
}>;

export type EduStudentExportResult = BaseResult<{
  list: EduStudentExportRow[];
}>;

export const getEduStudentListAPI = (params?: EduStudentListParams) => {
  return http.request<EduStudentListResult>("get", baseUrlApi("eduStudent/list"), { params });
};

export const getEduStudentDetailAPI = (id: number) => {
  return http.request<EduStudentDetailResult>("get", baseUrlApi(`eduStudent/${id}`));
};

export const addEduStudentAPI = (data: EduStudentAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("eduStudent/add"), { data });
};

export const editEduStudentAPI = (data: EduStudentUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("eduStudent/edit"), { data });
};

export const deleteEduStudentAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("eduStudent/delete"), { data });
};

export const importEduStudentAPI = (rows: EduStudentImportRow[]) => {
  return http.request<EduStudentImportResult>("post", baseUrlApi("eduStudent/import"), {
    data: { rows }
  });
};

export const exportEduStudentAPI = (params?: EduStudentListParams) => {
  return http.request<EduStudentExportResult>("get", baseUrlApi("eduStudent/export"), { params });
};
