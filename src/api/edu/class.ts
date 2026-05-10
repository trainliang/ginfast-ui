import { http } from "@/utils/http";
import { baseUrlApi } from "../utils";
import { BaseResult } from "../types";

export interface EduClassMemberItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  classId?: number;
  studentId?: number;
  studentName?: string;
  studentNo?: string;
  gender?: string;
  phone?: string;
  status?: number;
  joinAt?: string;
  remark?: string;
  [key: string]: unknown;
}

export interface EduClassItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  className: string;
  courseId?: number;
  courseName?: string;
  teacherId?: number;
  teacherName?: string;
  status?: number;
  capacity?: number;
  memberCount?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  members?: EduClassMemberItem[];
  [key: string]: unknown;
}

export interface EduClassListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  className?: string;
  courseId?: number;
  teacherId?: number;
  teacherName?: string;
  status?: number;
}

export interface EduClassAddParams {
  className: string;
  courseId?: number;
  courseName?: string;
  teacherId?: number;
  teacherName?: string;
  status?: number;
  capacity?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  [key: string]: unknown;
}

export interface EduClassUpdateParams extends EduClassAddParams {
  id: number;
}

export interface EduClassMemberAddParams {
  classId: number;
  studentId?: number;
  studentName?: string;
  studentNo?: string;
  gender?: string;
  phone?: string;
  status?: number;
  joinAt?: string;
  remark?: string;
  [key: string]: unknown;
}

export interface EduClassMemberUpdateParams extends EduClassMemberAddParams {
  id: number;
}

export type EduClassImportRow = EduClassAddParams & {
  id?: number;
};

export type EduClassMemberImportRow = EduClassMemberAddParams & {
  id?: number;
};

export type EduClassExportRow = EduClassItem;

export type EduClassMemberExportRow = EduClassMemberItem;

export interface EduTeacherOptionItem {
  label: string;
  value: number | string;
  disabled?: boolean;
  [key: string]: unknown;
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

export type EduClassImportResult = BaseResult<{
  rows: EduClassImportRow[];
}>;

export type EduClassMemberImportResult = BaseResult<{
  rows: EduClassMemberImportRow[];
}>;

export type EduClassExportResult = BaseResult<{
  list: EduClassExportRow[];
}>;

export type EduClassMemberExportResult = BaseResult<{
  list: EduClassMemberExportRow[];
}>;

export const getEduClassListAPI = (params?: EduClassListParams) => {
  return http.request<EduClassListResult>("get", baseUrlApi("eduClass/list"), { params });
};

export const getEduClassDetailAPI = (id: number) => {
  return http.request<EduClassDetailResult>("get", baseUrlApi(`eduClass/${id}`));
};

export const addEduClassAPI = (data: EduClassAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("eduClass/add"), { data });
};

export const editEduClassAPI = (data: EduClassUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("eduClass/edit"), { data });
};

export const deleteEduClassAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("eduClass/delete"), { data });
};

export const importEduClassAPI = (rows: EduClassImportRow[]) => {
  return http.request<EduClassImportResult>("post", baseUrlApi("eduClass/import"), {
    data: { rows }
  });
};

export const exportEduClassAPI = (params?: EduClassListParams) => {
  return http.request<EduClassExportResult>("get", baseUrlApi("eduClass/export"), { params });
};

export const getEduClassMemberListAPI = (classId: number, params?: Omit<EduClassListParams, "className">) => {
  return http.request<EduClassMemberListResult>("get", baseUrlApi(`eduClass/members/${classId}`), {
    params
  });
};

export const addEduClassMemberAPI = (data: EduClassMemberAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("eduClass/members/addMember"), { data });
};

export const editEduClassMemberAPI = (data: EduClassMemberUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("eduClass/members/editMember"), { data });
};

export const deleteEduClassMemberAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("eduClass/members/deleteMember"), { data });
};

export const importEduClassMembersAPI = (rows: EduClassMemberImportRow[]) => {
  return http.request<EduClassMemberImportResult>("post", baseUrlApi("eduClass/members/importMembers"), {
    data: { rows }
  });
};

export const exportEduClassMembersAPI = (classId: number) => {
  return http.request<EduClassMemberExportResult>("get", baseUrlApi(`eduClass/members/exportMembers/${classId}`));
};

export const getEduClassTeacherOptionsAPI = () => {
  return http.request<EduClassTeacherOptionsResult>("get", baseUrlApi("eduClass/teacherOptions"));
};
