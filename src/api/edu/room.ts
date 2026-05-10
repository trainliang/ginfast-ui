import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";
import type { EduImportResultData } from "./student";

export interface EduRoomWeeklyRule {
  id?: number;
  roomId?: number;
  weekday: number;
  startTime: string;
  endTime: string;
  available?: number;
  remark?: string;
}

export interface EduRoomException {
  id?: number;
  roomId?: number;
  exceptionDate: string;
  type: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface EduRoomItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  code: string;
  type?: string;
  capacity: number;
  location?: string;
  status?: number;
  remark?: string;
}

export interface EduRoomListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  name?: string;
  code?: string;
  type?: string;
  status?: number;
  location?: string;
}

export type EduRoomAddParams = Omit<EduRoomItem, "id" | "createdAt" | "updatedAt">;

export interface EduRoomUpdateParams extends EduRoomAddParams {
  id: number;
}

export type EduRoomImportRow = Partial<EduRoomAddParams>;
export type EduRoomWeeklyRuleImportRow = Partial<EduRoomWeeklyRule>;
export type EduRoomExceptionImportRow = Partial<EduRoomException>;
export type EduRoomExportRow = EduRoomItem;

export interface EduRoomOptionItem {
  id: number;
  name: string;
  code: string;
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
  total: number;
}>;
export type EduRoomExceptionResult = BaseResult<{
  list: EduRoomException[];
  total: number;
}>;
export type EduRoomImportResult = BaseResult<EduImportResultData>;
export type EduRoomWeeklyRuleImportResult = BaseResult<EduImportResultData>;
export type EduRoomExceptionImportResult = BaseResult<EduImportResultData>;
export type EduRoomExportResult = BaseResult<{
  list: EduRoomExportRow[];
}>;

export const getEduRoomListAPI = (params?: EduRoomListParams) => {
  return http.request<EduRoomListResult>("get", baseUrlApi("edu/rooms/list"), { params });
};

export const getEduRoomOptionsAPI = () => {
  return http.request<EduRoomOptionsResult>("get", baseUrlApi("edu/rooms/options"));
};

export const getEduRoomDetailAPI = (id: number) => {
  return http.request<EduRoomDetailResult>("get", baseUrlApi(`edu/rooms/${id}`));
};

export const addEduRoomAPI = (data: EduRoomAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/rooms/add"), { data });
};

export const editEduRoomAPI = (data: EduRoomUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/rooms/edit"), { data });
};

export const deleteEduRoomAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/rooms/delete"), { data });
};

export const importEduRoomAPI = (rows: EduRoomImportRow[]) => {
  return http.request<EduRoomImportResult>("post", baseUrlApi("edu/rooms/import"), {
    data: { rows },
  });
};

export const exportEduRoomAPI = (params?: { ids?: number[] }) => {
  return http.request<EduRoomExportResult>("get", baseUrlApi("edu/rooms/export"), { params });
};

export const getEduRoomWeeklyRulesAPI = (roomId: number) => {
  return http.request<EduRoomWeeklyRuleResult>("get", baseUrlApi(`edu/rooms/${roomId}/weekly-rules`));
};

export const saveEduRoomWeeklyRulesAPI = (roomId: number, rows: EduRoomWeeklyRule[]) => {
  return http.request<BaseResult>("post", baseUrlApi(`edu/rooms/${roomId}/weekly-rules/save`), {
    data: { rows },
  });
};

export const getEduRoomExceptionsAPI = (roomId: number) => {
  return http.request<EduRoomExceptionResult>("get", baseUrlApi(`edu/rooms/${roomId}/exceptions`));
};

export const addEduRoomExceptionAPI = (roomId: number, data: EduRoomException) => {
  return http.request<BaseResult>("post", baseUrlApi(`edu/rooms/${roomId}/exceptions/add`), { data });
};

export const editEduRoomExceptionAPI = (roomId: number, data: EduRoomException) => {
  return http.request<BaseResult>("put", baseUrlApi(`edu/rooms/${roomId}/exceptions/edit`), { data });
};

export const deleteEduRoomExceptionAPI = (roomId: number, data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi(`edu/rooms/${roomId}/exceptions/delete`), { data });
};

export const importEduRoomWeeklyRulesAPI = (rows: EduRoomWeeklyRuleImportRow[]) => {
  return http.request<EduRoomWeeklyRuleImportResult>("post", baseUrlApi("edu/rooms/weekly-rules/import"), {
    data: { rows },
  });
};

export const importEduRoomExceptionsAPI = (rows: EduRoomExceptionImportRow[]) => {
  return http.request<EduRoomExceptionImportResult>("post", baseUrlApi("edu/rooms/exceptions/import"), {
    data: { rows },
  });
};
