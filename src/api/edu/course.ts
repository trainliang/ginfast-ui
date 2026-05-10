import { http } from "@/utils/http";
import { baseUrlApi } from "../utils";
import { BaseResult } from "../types";

export interface EduCourseItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  courseName: string;
  courseCode?: string;
  teacherId?: number;
  teacherName?: string;
  category?: string;
  status?: number;
  totalHours?: number;
  price?: number;
  description?: string;
  [key: string]: unknown;
}

export interface EduCourseListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  courseName?: string;
  courseCode?: string;
  teacherId?: number;
  teacherName?: string;
  status?: number;
}

export interface EduCourseAddParams {
  courseName: string;
  courseCode?: string;
  teacherId?: number;
  teacherName?: string;
  category?: string;
  status?: number;
  totalHours?: number;
  price?: number;
  description?: string;
  [key: string]: unknown;
}

export interface EduCourseUpdateParams extends EduCourseAddParams {
  id: number;
}

export type EduCourseImportRow = EduCourseAddParams & {
  id?: number;
};

export type EduCourseExportRow = EduCourseItem;

export interface EduCourseOptionItem {
  label: string;
  value: number | string;
  disabled?: boolean;
  [key: string]: unknown;
}

export type EduCourseListResult = BaseResult<{
  list: EduCourseItem[];
  total: number;
}>;

export type EduCourseDetailResult = BaseResult<EduCourseItem>;

export type EduCourseOptionsResult = BaseResult<{
  list: EduCourseOptionItem[];
}>;

export type EduCourseImportResult = BaseResult<{
  rows: EduCourseImportRow[];
}>;

export type EduCourseExportResult = BaseResult<{
  list: EduCourseExportRow[];
}>;

export const getEduCourseListAPI = (params?: EduCourseListParams) => {
  return http.request<EduCourseListResult>("get", baseUrlApi("eduCourse/list"), { params });
};

export const getEduCourseOptionsAPI = () => {
  return http.request<EduCourseOptionsResult>("get", baseUrlApi("eduCourse/options"));
};

export const getEduCourseDetailAPI = (id: number) => {
  return http.request<EduCourseDetailResult>("get", baseUrlApi(`eduCourse/${id}`));
};

export const addEduCourseAPI = (data: EduCourseAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("eduCourse/add"), { data });
};

export const editEduCourseAPI = (data: EduCourseUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("eduCourse/edit"), { data });
};

export const deleteEduCourseAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("eduCourse/delete"), { data });
};

export const importEduCourseAPI = (rows: EduCourseImportRow[]) => {
  return http.request<EduCourseImportResult>("post", baseUrlApi("eduCourse/import"), {
    data: { rows }
  });
};

export const exportEduCourseAPI = (params?: EduCourseListParams) => {
  return http.request<EduCourseExportResult>("get", baseUrlApi("eduCourse/export"), { params });
};
