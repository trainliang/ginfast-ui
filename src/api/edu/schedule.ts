import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";

export interface EduScheduleRuleItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  ruleType: "class" | "one_to_one";
  repeatType: "single" | "weekly";
  termId?: string;
  startDate?: string | null;
  endDate?: string | null;
  weekdays?: number[];
  startTime: string;
  endTime: string;
  classId?: string;
  studentId?: string;
  courseId?: string;
  teacherId?: string;
  teachingMode?: string;
  requiresRoom?: number;
  roomId?: string;
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
  termId?: string;
  classId?: string;
  studentId?: string;
  courseId?: string;
  teacherId?: string;
  status?: number;
}

export type EduScheduleRuleAddParams = Omit<EduScheduleRuleItem, "id" | "createdAt" | "updatedAt">;

export interface EduScheduleRuleUpdateParams extends EduScheduleRuleAddParams {
  id: string;
}

export interface EduLessonItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  ruleId?: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  courseId?: string;
  classId?: string;
  studentId?: string;
  teacherId?: string;
  teachingMode?: string;
  requiresRoom?: number;
  roomId?: string;
  status?: string;
  remark?: string;
}

export interface EduLessonListParams {
  pageNum?: number;
  pageSize?: number;
  order?: string;
  id?: string;
  ruleId?: string;
  status?: string;
  classId?: string;
  studentId?: string;
  courseId?: string;
  teacherId?: string;
}

export interface EduLessonCalendarParams {
  startDate?: string;
  endDate?: string;
  classId?: string;
  teacherId?: string;
  studentId?: string;
  roomId?: string;
}

export interface EduScheduleConflictCheckParams {
  lessonId?: string;
  ruleId?: string;
  lessonDate?: string;
  classId?: string;
  studentId?: string;
  courseId?: string;
  teacherId?: string;
  teachingMode?: string;
  requiresRoom?: number;
  roomId?: string;
  startTime?: string;
  endTime?: string;
  allowConflictOverride?: boolean;
  overrideReason?: string;
  operatorID?: string;
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
export interface EduLessonChangeLogItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  lessonId?: string;
  ruleId?: string;
  actionType?: string;
  beforeData?: string;
  afterData?: string;
  reason?: string;
  operatorId?: string;
  occurredAt?: string;
}
export type EduLessonChangeLogsResult = BaseResult<{ list?: EduLessonChangeLogItem[] }>;

export interface EduLessonRescheduleParams {
  lessonId: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teachingMode: string;
  roomId?: string;
  allowConflictOverride?: boolean;
  overrideReason?: string;
}

export interface EduLessonStatusActionParams {
  lessonId: string;
  reason: string;
}

export interface EduLessonMakeupParams {
  lessonId: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  teachingMode: string;
  roomId?: string;
  reason: string;
  allowConflictOverride?: boolean;
  overrideReason?: string;
}

export const getEduScheduleRuleListAPI = (params?: EduScheduleRuleListParams) => {
  return http.request<EduScheduleRuleListResult>("get", baseUrlApi("edu/schedule-rules/list"), { params });
};

export const addEduScheduleRuleAPI = (data: EduScheduleRuleAddParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/schedule-rules/add"), { data });
};

export const editEduScheduleRuleAPI = (data: EduScheduleRuleUpdateParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/schedule-rules/edit"), { data });
};

export const deleteEduScheduleRuleAPI = (data: { id: string }) => {
  return http.request<BaseResult>("delete", baseUrlApi("edu/schedule-rules/delete"), { data });
};

export const previewEduScheduleRuleChangeAPI = (data: { id: string }) => {
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

export const rescheduleEduLessonAPI = (data: EduLessonRescheduleParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/lessons/reschedule"), { data });
};

export const stopEduLessonAPI = (data: EduLessonStatusActionParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/lessons/stop"), { data });
};

export const cancelEduLessonAPI = (data: EduLessonStatusActionParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/lessons/cancel"), { data });
};

export const restoreEduLessonAPI = (data: EduLessonStatusActionParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/lessons/restore"), { data });
};

export const makeupEduLessonAPI = (data: EduLessonMakeupParams) => {
  return http.request<BaseResult>("post", baseUrlApi("edu/lessons/makeup"), { data });
};

export const getEduLessonChangeLogsAPI = (lessonId: string) => {
  return http.request<EduLessonChangeLogsResult>("get", baseUrlApi(`edu/lessons/${lessonId}/change-logs`));
};
