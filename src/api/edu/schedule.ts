import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";

export interface EduScheduleRuleItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  ruleType: "class" | "one_to_one";
  repeatType: "single" | "weekly";
  termId?: number;
  startDate?: string | null;
  endDate?: string | null;
  weekday?: number;
  startTime: string;
  endTime: string;
  classId?: number;
  studentId?: number;
  courseId?: number;
  teacherId?: number;
  teachingMode?: string;
  requiresRoom?: number;
  roomId?: number;
  version?: number;
  effectiveFrom?: string | null;
  status?: number;
  remark?: string;
}

export interface EduScheduleRuleListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  name?: string;
  ruleType?: string;
  repeatType?: string;
  termId?: number;
  classId?: number;
  studentId?: number;
  courseId?: number;
  teacherId?: number;
  status?: number;
}

export type EduScheduleRuleAddParams = Omit<EduScheduleRuleItem, "id" | "createdAt" | "updatedAt">;

export interface EduScheduleRuleUpdateParams extends EduScheduleRuleAddParams {
  id: number;
}

export interface EduLessonItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  ruleId?: number;
  lessonDate: string;
  startTime: string;
  endTime: string;
  courseId?: number;
  classId?: number;
  studentId?: number;
  teacherId?: number;
  teachingMode?: string;
  requiresRoom?: number;
  roomId?: number;
  status?: string;
  remark?: string;
}

export interface EduLessonListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: number;
  ruleId?: number;
  status?: string;
  classId?: number;
  studentId?: number;
  courseId?: number;
  teacherId?: number;
}

export interface EduLessonCalendarParams {
  startDate?: string;
  endDate?: string;
  classId?: number;
  teacherId?: number;
}

export interface EduScheduleConflictCheckParams {
  lessonId?: number;
  ruleId?: number;
  lessonDate?: string;
  classId?: number;
  studentId?: number;
  courseId?: number;
  teacherId?: number;
  teachingMode?: string;
  requiresRoom?: number;
  roomId?: number;
  startTime?: string;
  endTime?: string;
  allowConflictOverride?: boolean;
  overrideReason?: string;
  operatorID?: number;
}

export type EduScheduleRuleListResult = BaseResult<{ list: EduScheduleRuleItem[]; total: number }>;
export type EduLessonListResult = BaseResult<{ list: EduLessonItem[]; total: number }>;
export type EduLessonCalendarResult = BaseResult<{ list: EduLessonItem[] }>;
export interface EduScheduleConflictItem {
  conflictType: string;
  conflictKey: string;
  reason: string;
}
export type EduScheduleConflictCheckResult = BaseResult<{ items?: EduScheduleConflictItem[]; hasConflict?: boolean }>;
export type EduSchedulePreviewChangeResult = BaseResult<{ list?: EduLessonItem[] }>;

export const getEduScheduleRuleListAPI = (params?: EduScheduleRuleListParams) => {
  return http.request<EduScheduleRuleListResult>("get", baseUrlApi("edu/schedule-rules/list"), { params });
};

export const addEduScheduleRuleAPI = (data: EduScheduleRuleAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/schedule-rules/add"), { data });
};

export const editEduScheduleRuleAPI = (data: EduScheduleRuleUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/schedule-rules/edit"), { data });
};

export const deleteEduScheduleRuleAPI = (data: { id: number }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/schedule-rules/delete"), { data });
};

export const previewEduScheduleRuleChangeAPI = (data: { id: number }) => {
  return http.request<EduSchedulePreviewChangeResult>("post", baseUrlApi("edu/schedule-rules/preview-change"), {
    data,
  });
};

export const getEduLessonListAPI = (params?: EduLessonListParams) => {
  return http.request<EduLessonListResult>("get", baseUrlApi("edu/lessons/list"), { params });
};

export const getEduLessonCalendarAPI = (params?: EduLessonCalendarParams) => {
  return http.request<EduLessonCalendarResult>("get", baseUrlApi("edu/lessons/calendar"), { params });
};

export const checkEduScheduleConflictsAPI = (data: EduScheduleConflictCheckParams) => {
  return http.request<EduScheduleConflictCheckResult>("post", baseUrlApi("edu/schedules/check-conflicts"), { data });
};
