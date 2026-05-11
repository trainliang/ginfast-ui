import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";
import type { EduImportResultData } from "./student";

export interface EduClassItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  code: string;
  classType: string;
  courseId: number;
  teacherId: number;
  roomId?: number;
  capacity: number;
  benefitCheckPolicy?: string;
  status?: number;
  startDate?: string | null;
  endDate?: string | null;
  remark?: string;
}

export interface EduClassMemberItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  classId: number;
  studentId: number;
  joinDate?: string | null;
  leaveDate?: string | null;
  status: string;
  remark?: string;
}

export interface EduClassListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  name?: string;
  code?: string;
  classType?: string;
  courseId?: number;
  teacherId?: number;
  roomId?: number;
  benefitCheckPolicy?: string;
  status?: number;
}

export interface EduClassMemberListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  classId?: number;
  studentId?: number;
  status?: string;
}

export type EduClassAddParams = Omit<EduClassItem, "id" | "createdAt" | "updatedAt">;

export interface EduClassUpdateParams extends EduClassAddParams {
  id: number;
}

export type EduClassMemberAddParams = Omit<EduClassMemberItem, "id" | "createdAt" | "updatedAt">;

export interface EduClassMemberUpdateParams extends EduClassMemberAddParams {
  id: number;
}

export type EduClassImportRow = Partial<EduClassAddParams>;
export type EduClassMemberImportRow = Partial<EduClassMemberAddParams>;
export type EduClassExportRow = EduClassItem;
export type EduClassMemberExportRow = EduClassMemberItem;

export interface EduTeacherOptionItem {
  id: number;
  username: string;
  nickName?: string;
  name?: string;
}

export type EduClassListResult = BaseResult<{
  list: EduClassItem[];
  total: number;
}>;

export type EduClassDetailResult = BaseResult<EduClassItem>;
export type EduClassMemberListResult = BaseResult<{
  list: EduClassMemberItem[];
  total: number;
}>;
export type EduClassTeacherOptionsResult = BaseResult<{
  list: EduTeacherOptionItem[];
}>;
export interface EduTeacherRoleConfigRoleItem {
  id: number;
  name: string;
  status: number;
  tenantID: number;
}

export interface EduTeacherRoleConfigData {
  roles: EduTeacherRoleConfigRoleItem[];
  selectedRoleIds: number[];
}

export type EduTeacherRoleConfigResult = BaseResult<EduTeacherRoleConfigData>;
export type EduClassImportResult = BaseResult<EduImportResultData>;
export type EduClassMemberImportResult = BaseResult<EduImportResultData>;
export type EduClassExportResult = BaseResult<{
  list: EduClassExportRow[];
}>;
export type EduClassMemberExportResult = BaseResult<{
  list: EduClassMemberExportRow[];
}>;

export const getEduClassListAPI = (params?: EduClassListParams) => {
  return http.request<EduClassListResult>("get", baseUrlApi("edu/classes/list"), { params });
};

export const getEduClassDetailAPI = (id: number) => {
  return http.request<EduClassDetailResult>("get", baseUrlApi(`edu/classes/${id}`));
};

export const addEduClassAPI = (data: EduClassAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/classes/add"), { data });
};

export const editEduClassAPI = (data: EduClassUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/classes/edit"), { data });
};

export const deleteEduClassAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/classes/delete"), { data });
};

export const importEduClassAPI = (rows: EduClassImportRow[]) => {
  return http.request<EduClassImportResult>("post", baseUrlApi("edu/classes/import"), {
    data: { rows },
  });
};

export const exportEduClassAPI = (params?: { ids?: number[] }) => {
  return http.request<EduClassExportResult>("get", baseUrlApi("edu/classes/export"), { params });
};

export const getEduClassMemberListAPI = (classId: number, params?: Omit<EduClassMemberListParams, "classId">) => {
  return http.request<EduClassMemberListResult>("get", baseUrlApi(`edu/classes/${classId}/members`), {
    params,
  });
};

export const addEduClassMemberAPI = (classId: number, data: EduClassMemberAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi(`edu/classes/${classId}/members/add`), { data });
};

export const editEduClassMemberAPI = (classId: number, data: EduClassMemberUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi(`edu/classes/${classId}/members/edit`), { data });
};

export const deleteEduClassMemberAPI = (classId: number, data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi(`edu/classes/${classId}/members/delete`), { data });
};

export const importEduClassMembersAPI = (rows: EduClassMemberImportRow[]) => {
  return http.request<EduClassMemberImportResult>("post", baseUrlApi("edu/classes/members/import"), {
    data: { rows },
  });
};

export const exportEduClassMembersAPI = (params?: { ids?: number[] }) => {
  return http.request<EduClassMemberExportResult>("get", baseUrlApi("edu/classes/members/export"), { params });
};

export const getEduClassTeacherOptionsAPI = () => {
  return http.request<EduClassTeacherOptionsResult>("get", baseUrlApi("edu/classes/teacher-options"));
};

export const getEduTeacherRoleConfigAPI = () => {
  return http.request<EduTeacherRoleConfigResult>("get", baseUrlApi("edu/classes/teacher-role-config"));
};

export const saveEduTeacherRoleConfigAPI = (roleIds: number[]) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/classes/teacher-role-config"), {
    data: { roleIds },
  });
};
