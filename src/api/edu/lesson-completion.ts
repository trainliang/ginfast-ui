import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";

export const eduLessonCompletionResultTypes = [
  "attended",
  "student_leave",
  "student_absent",
  "teacher_stopped",
  "institution_canceled",
  "makeup_completed",
] as const;

export type EduLessonCompletionResultType = (typeof eduLessonCompletionResultTypes)[number];

export interface EduLessonCompletionRuleItem {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  resultType: EduLessonCompletionResultType;
  deductEnabled?: number;
  deductMode?: "fixed_count" | "duration";
  fixedCount?: number;
  durationUnitMinutes?: number;
  insufficientPolicy?: "block" | "allow_arrears";
  status?: number;
  remark?: string;
  createdBy?: number;
  tenantID?: number;
  source?: "default" | "tenant";
}

export interface EduLessonCompletionRuleSaveParams {
  items: EduLessonCompletionRuleItem[];
}

export interface EduLessonCompletionStudentStatusItem {
  studentId: number;
  completion?: EduLessonStudentCompletionItem;
  processed: boolean;
}

export interface EduLessonCompletionStatusItem {
  lesson?: EduLessonCompletionLessonItem;
  students: EduLessonCompletionStudentStatusItem[];
  unprocessedCount: number;
}

export interface EduLessonCompletionSubmitItemParams {
  studentId: string | number;
  resultType: EduLessonCompletionResultType;
  reason?: string;
}

export interface EduLessonCompletionSubmitParams {
  lessonId: string | number;
  items: EduLessonCompletionSubmitItemParams[];
}

export interface EduLessonCompletionRevokeParams {
  lessonId: string | number;
  studentId: string | number;
  reason: string;
}

export interface EduLessonCompleteParams {
  lessonId: string | number;
  reason?: string;
}

export interface EduLessonCompletionLessonItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  ruleId?: number;
  lessonDate?: string;
  startTime?: string;
  endTime?: string;
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

export interface EduLessonStudentCompletionItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  lessonId: number;
  studentId: number;
  classId?: number;
  courseId?: number;
  teacherId?: number;
  resultType: string;
  deductEnabled?: number;
  deductCount?: number;
  studentBenefitId?: number;
  status: "completed" | "arrears" | "revoked" | string;
  ledgerId?: number;
  revokeLedgerId?: number;
  reason?: string;
  operatorId?: number;
  completedAt?: string | null;
  revokedAt?: string | null;
  revokedBy?: number;
  revokeReason?: string;
  version?: number;
  createdBy?: number;
  tenantID?: number;
}

export type EduLessonCompletionRuleListResult = BaseResult<{ list: EduLessonCompletionRuleItem[] }>;
export type EduLessonCompletionStatusResult = BaseResult<EduLessonCompletionStatusItem>;
export type EduLessonCompletionSubmitResult = BaseResult<{ list: EduLessonStudentCompletionItem[] }>;

export const getEduLessonCompletionRulesAPI = () => {
  return http.request<EduLessonCompletionRuleListResult>("get", baseUrlApi("edu/lesson-completion/rules"));
};

export const saveEduLessonCompletionRulesAPI = (data: EduLessonCompletionRuleSaveParams) => {
  return http.request<BaseResult>("put", baseUrlApi("edu/lesson-completion/rules"), { data });
};

export const getEduLessonCompletionStatusAPI = (lessonId: string | number) => {
  return http.request<EduLessonCompletionStatusResult>("get", baseUrlApi(`edu/lessons/${lessonId}/completions`));
};

export const submitEduLessonCompletionsAPI = (lessonId: string | number, data: EduLessonCompletionSubmitParams) => {
  return http.request<EduLessonCompletionSubmitResult>("post", baseUrlApi(`edu/lessons/${lessonId}/completions`), {
    data,
  });
};

export const revokeEduLessonCompletionAPI = (lessonId: string | number, studentId: string | number, data: { reason: string }) => {
  return http.request<BaseResult>("post", baseUrlApi(`edu/lessons/${lessonId}/completions/${studentId}/revoke`), {
    data,
  });
};

export const completeEduLessonAPI = (lessonId: string | number, data?: EduLessonCompleteParams) => {
  return http.request<BaseResult>("post", baseUrlApi(`edu/lessons/${lessonId}/complete`), { data });
};
