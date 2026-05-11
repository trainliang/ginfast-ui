import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";
import type { EduImportResultData } from "./student";

export interface EduCourseItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  code: string;
  type?: string;
  gradeRange?: string;
  defaultTeachingMode?: string;
  requiresRoom?: number;
  status?: number;
  sort?: number;
  description?: string;
}

export interface EduCourseListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  name?: string;
  code?: string;
  type?: string;
  status?: number;
  gradeRange?: string;
  defaultTeachingMode?: string;
  requiresRoom?: number;
  description?: string;
}

export type EduCourseAddParams = Omit<EduCourseItem, "id" | "createdAt" | "updatedAt">;

export interface EduCourseUpdateParams extends EduCourseAddParams {
  id: number;
}

export type EduCourseImportRow = Partial<EduCourseAddParams>;
export type EduCourseExportRow = EduCourseItem;

export interface EduCourseOptionItem {
  id: number;
  name: string;
  code: string;
}

export type EduCourseListResult = BaseResult<{
  list: EduCourseItem[];
  total: number;
}>;

export type EduCourseDetailResult = BaseResult<EduCourseItem>;
export type EduCourseOptionsResult = BaseResult<{
  list: EduCourseOptionItem[];
}>;
export type EduCourseImportResult = BaseResult<EduImportResultData>;
export type EduCourseExportResult = BaseResult<{
  list: EduCourseExportRow[];
}>;

export const getEduCourseListAPI = (params?: EduCourseListParams) => {
  return http.request<EduCourseListResult>("get", baseUrlApi("edu/courses/list"), { params });
};

export const getEduCourseOptionsAPI = () => {
  return http.request<EduCourseOptionsResult>("get", baseUrlApi("edu/courses/options"));
};

export const getEduCourseDetailAPI = (id: number) => {
  return http.request<EduCourseDetailResult>("get", baseUrlApi(`edu/courses/${id}`));
};

export const addEduCourseAPI = (data: EduCourseAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/courses/add"), { data });
};

export const editEduCourseAPI = (data: EduCourseUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/courses/edit"), { data });
};

export const deleteEduCourseAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/courses/delete"), { data });
};

export const importEduCourseAPI = (rows: EduCourseImportRow[]) => {
  return http.request<EduCourseImportResult>("post", baseUrlApi("edu/courses/import"), {
    data: { rows },
  });
};

export const exportEduCourseAPI = (params?: { ids?: number[] }) => {
  return http.request<EduCourseExportResult>("get", baseUrlApi("edu/courses/export"), { params });
};
