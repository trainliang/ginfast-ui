import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";

export interface EduTermItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: number;
}

export interface EduTermListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  name?: string;
  status?: number;
}

export type EduTermAddParams = Omit<EduTermItem, "id" | "createdAt" | "updatedAt">;

export interface EduTermUpdateParams extends EduTermAddParams {
  id: number;
}

export interface EduTermClosedDayItem {
  id?: number;
  termId?: number;
  closedDate: string;
  reason?: string;
}

export interface EduTermClosedDaysResult {
  list: EduTermClosedDayItem[];
}

export type EduTermListResult = BaseResult<{
  list: EduTermItem[];
  total: number;
}>;

export type EduTermClosedDaysListResult = BaseResult<EduTermClosedDaysResult>;

export const getEduTermListAPI = (params?: EduTermListParams) => {
  return http.request<EduTermListResult>("get", baseUrlApi("edu/terms/list"), { params });
};

export const addEduTermAPI = (data: EduTermAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/terms/add"), { data });
};

export const editEduTermAPI = (data: EduTermUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/terms/edit"), { data });
};

export const deleteEduTermAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/terms/delete"), { data });
};

export const getEduTermClosedDaysAPI = (id: number) => {
  return http.request<EduTermClosedDaysListResult>("get", baseUrlApi(`edu/terms/${id}/closed-days`));
};

export const saveEduTermClosedDaysAPI = (id: number, rows: EduTermClosedDayItem[]) => {
  return http.request<BaseResult>("post", baseUrlApi(`edu/terms/${id}/closed-days/save`), {
    data: { rows },
  });
};
