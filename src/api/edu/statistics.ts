import { http } from "@/utils/http";
import { BaseResult } from "../types";
import { baseUrlApi } from "../utils";

export interface EduStatisticsFilterParams {
  startDate?: string;
  endDate?: string;
  courseId?: number;
  teacherId?: number;
  roomId?: number;
  classId?: number;
  studentId?: number;
}

export interface EduTeacherLessonSummary {
  teacherId: number;
  lessonCount: number;
  totalMinutes: number;
}

export interface EduRoomUsageSummary {
  roomId: number;
  lessonCount: number;
  totalMinutes: number;
}

export interface EduClassLessonSummary {
  classId: number;
  lessonCount: number;
  totalMinutes: number;
}

export interface EduOneToOneLessonSummary {
  studentId: number;
  lessonCount: number;
  totalMinutes: number;
}

export interface EduScheduleConflictTypeSummary {
  conflictType: string;
  count: number;
}

export interface EduLessonEligibilityDetail {
  lessonId: number;
  studentId: number;
  courseId: number;
  classId: number;
  studentBenefitId: number;
  eligibilityStatus: string;
  reasonCode: string;
  checkedAt?: string;
}

export interface EduScheduleConflictOverrideDetail {
  ruleId: number;
  lessonId: number;
  conflictType: string;
  conflictKey: string;
  reason: string;
  operatorId: number;
  occurredAt?: string;
}

export interface EduScheduleStatisticsData {
  teacherLessons: EduTeacherLessonSummary[];
  roomUsages: EduRoomUsageSummary[];
  classLessons: EduClassLessonSummary[];
  oneToOneLessons: EduOneToOneLessonSummary[];
  eligibilityDetails: EduLessonEligibilityDetail[];
  conflictOverrides: EduScheduleConflictTypeSummary[];
  conflictDetails: EduScheduleConflictOverrideDetail[];
}

export interface EduBenefitCourseSummary {
  courseId: number;
  benefitCount: number;
}

export interface EduBenefitStatisticsData {
  validCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  zeroRemainingCount: number;
  courseBenefitCounts: EduBenefitCourseSummary[];
}

export interface EduExternalSyncStatusSummary {
  status: string;
  count: number;
}

export interface EduExternalSyncStatisticsData {
  statusCounts: EduExternalSyncStatusSummary[];
  failedCount: number;
  retryingCount: number;
  dueRetryCount: number;
}

export type EduScheduleStatisticsResult = BaseResult<EduScheduleStatisticsData>;
export type EduBenefitStatisticsResult = BaseResult<EduBenefitStatisticsData>;
export type EduExternalSyncStatisticsResult = BaseResult<EduExternalSyncStatisticsData>;

export const getEduScheduleStatisticsAPI = (params?: EduStatisticsFilterParams) => {
  return http.request<EduScheduleStatisticsResult>("get", baseUrlApi("edu/statistics/schedule"), { params });
};

export const getEduBenefitStatisticsAPI = (params?: EduStatisticsFilterParams) => {
  return http.request<EduBenefitStatisticsResult>("get", baseUrlApi("edu/statistics/benefits"), { params });
};

export const getEduExternalSyncStatisticsAPI = (params?: EduStatisticsFilterParams) => {
  return http.request<EduExternalSyncStatisticsResult>("get", baseUrlApi("edu/statistics/external-sync"), { params });
};
