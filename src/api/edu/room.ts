import { http } from "@/utils/http";
import { baseUrlApi } from "../utils";
import { BaseResult } from "../types";

export interface EduRoomWeeklyRule {
  id?: number;
  roomId?: number;
  weekDay?: number;
  startTime: string;
  endTime: string;
  courseId?: number;
  classId?: number;
  enabled?: boolean;
  remark?: string;
  [key: string]: unknown;
}

export interface EduRoomException {
  id?: number;
  roomId?: number;
  ruleId?: number;
  exceptionDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  status?: number;
  [key: string]: unknown;
}

export interface EduRoomItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  roomName: string;
  roomCode?: string;
  location?: string;
  capacity?: number;
  status?: number;
  description?: string;
  weeklyRules?: EduRoomWeeklyRule[];
  exceptions?: EduRoomException[];
  [key: string]: unknown;
}

export interface EduRoomListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  roomName?: string;
  roomCode?: string;
  location?: string;
  status?: number;
}

export interface EduRoomAddParams {
  roomName: string;
  roomCode?: string;
  location?: string;
  capacity?: number;
  status?: number;
  description?: string;
  [key: string]: unknown;
}

export interface EduRoomUpdateParams extends EduRoomAddParams {
  id: number;
}

export type EduRoomImportRow = EduRoomAddParams & {
  id?: number;
};

export type EduRoomWeeklyRuleImportRow = EduRoomWeeklyRule;

export type EduRoomExceptionImportRow = EduRoomException;

export type EduRoomExportRow = EduRoomItem;

export type EduRoomWeeklyRuleExportRow = EduRoomWeeklyRule;

export type EduRoomExceptionExportRow = EduRoomException;

export interface EduRoomOptionItem {
  label: string;
  value: number | string;
  disabled?: boolean;
  [key: string]: unknown;
}

export type EduRoomListResult = BaseResult<{
  list: EduRoomItem[];
  total: number;
}>;

export type EduRoomDetailResult = BaseResult<EduRoomItem>;

export type EduRoomOptionsResult = BaseResult<{
  list: EduRoomOptionItem[];
}>;

export type EduRoomWeeklyRuleResult = BaseResult<{
  list: EduRoomWeeklyRule[];
}>;

export type EduRoomExceptionResult = BaseResult<{
  list: EduRoomException[];
}>;

export type EduRoomImportResult = BaseResult<{
  rows: EduRoomImportRow[];
}>;

export type EduRoomWeeklyRuleImportResult = BaseResult<{
  rows: EduRoomWeeklyRuleImportRow[];
}>;

export type EduRoomExceptionImportResult = BaseResult<{
  rows: EduRoomExceptionImportRow[];
}>;

export type EduRoomExportResult = BaseResult<{
  list: EduRoomExportRow[];
}>;

export type EduRoomWeeklyRuleExportResult = BaseResult<{
  list: EduRoomWeeklyRuleExportRow[];
}>;

export type EduRoomExceptionExportResult = BaseResult<{
  list: EduRoomExceptionExportRow[];
}>;

export const getEduRoomListAPI = (params?: EduRoomListParams) => {
  return http.request<EduRoomListResult>("get", baseUrlApi("eduRoom/list"), { params });
};

export const getEduRoomOptionsAPI = () => {
  return http.request<EduRoomOptionsResult>("get", baseUrlApi("eduRoom/options"));
};

export const getEduRoomDetailAPI = (id: number) => {
  return http.request<EduRoomDetailResult>("get", baseUrlApi(`eduRoom/${id}`));
};

export const addEduRoomAPI = (data: EduRoomAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("eduRoom/add"), { data });
};

export const editEduRoomAPI = (data: EduRoomUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("eduRoom/edit"), { data });
};

export const deleteEduRoomAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("eduRoom/delete"), { data });
};

export const importEduRoomAPI = (rows: EduRoomImportRow[]) => {
  return http.request<EduRoomImportResult>("post", baseUrlApi("eduRoom/import"), {
    data: { rows }
  });
};

export const exportEduRoomAPI = (params?: EduRoomListParams) => {
  return http.request<EduRoomExportResult>("get", baseUrlApi("eduRoom/export"), { params });
};

export const getEduRoomWeeklyRulesAPI = (roomId: number) => {
  return http.request<EduRoomWeeklyRuleResult>("get", baseUrlApi(`eduRoom/weeklyRules/${roomId}`));
};

export const saveEduRoomWeeklyRulesAPI = (data: { roomId: number; rows: EduRoomWeeklyRule[] }) => {
  return http.request<BaseResult>("post", baseUrlApi("eduRoom/weeklyRules/saveWeeklyRules"), { data });
};

export const addEduRoomExceptionAPI = (data: EduRoomException) => {
  return http.request<BaseResult>("post", baseUrlApi("eduRoom/exceptions/addException"), { data });
};

export const editEduRoomExceptionAPI = (data: EduRoomException) => {
  return http.request<BaseResult>("put", baseUrlApi("eduRoom/exceptions/editException"), { data });
};

export const deleteEduRoomExceptionAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("eduRoom/exceptions/deleteException"), { data });
};

export const importEduRoomWeeklyRulesAPI = (rows: EduRoomWeeklyRuleImportRow[]) => {
  return http.request<EduRoomWeeklyRuleImportResult>("post", baseUrlApi("eduRoom/importWeeklyRules"), {
    data: { rows }
  });
};

export const importEduRoomExceptionsAPI = (rows: EduRoomExceptionImportRow[]) => {
  return http.request<EduRoomExceptionImportResult>("post", baseUrlApi("eduRoom/importExceptions"), {
    data: { rows }
  });
};
