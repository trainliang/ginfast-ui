<template>
  <div class="snow-page">
    <div class="snow-inner edu-page lesson-completion-page">
      <div class="lesson-completion-hero">
        <div class="lesson-completion-hero__main">
          <div class="lesson-completion-hero__tag">消课管理</div>
          <div class="lesson-completion-hero__title">课次消课</div>
          <div class="lesson-completion-hero__subtitle">
            左侧选择课次，右侧同屏处理学生消课、异常结果、撤销与整节完成。
          </div>
        </div>
        <div class="lesson-completion-hero__stats">
          <a-card class="hero-stat" :bordered="false">
            <div class="hero-stat__value">{{ lessonList.length }}</div>
            <div class="hero-stat__label">课次数</div>
          </a-card>
          <a-card class="hero-stat" :bordered="false">
            <div class="hero-stat__value">{{ selectedLessonSummary.processedCount }}</div>
            <div class="hero-stat__label">已处理学生</div>
          </a-card>
          <a-card class="hero-stat" :bordered="false">
            <div class="hero-stat__value">{{ selectedLessonSummary.unprocessedCount }}</div>
            <div class="hero-stat__label">待处理学生</div>
          </a-card>
        </div>
      </div>

      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-select v-model="searchForm.status" placeholder="课次状态" allow-clear style="width: 130px">
              <a-option v-for="item in lessonStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.classId" placeholder="班级" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
            </a-select>
            <a-select v-model="searchForm.studentId" placeholder="学生" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in studentOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
            </a-select>
            <a-select v-model="searchForm.teacherId" placeholder="教师" allow-clear style="width: 160px">
              <a-option v-for="item in teacherOptions" :key="item.id" :value="item.id">{{ teacherName(item.id) }}</a-option>
            </a-select>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              查询
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </template>
        <template #right>
          <a-space wrap>
            <a-tag color="arcoblue">桌面端双栏处理</a-tag>
            <a-tag v-if="isMobile && mobileDetailVisible" color="orange">移动端单面板处理</a-tag>
            <a-tag color="green">已处理后可整节完成</a-tag>
          </a-space>
        </template>
      </s-layout-tools>

      <a-spin :loading="listLoading || statusLoading" class="lesson-completion-shell">
        <div class="lesson-completion-layout" :class="{ 'is-mobile': isMobile }">
          <section v-if="!isMobile || !mobileDetailVisible" class="panel panel--lessons">
            <div class="panel__head">
              <div>
                <div class="panel__title">课次列表</div>
                <div class="panel__subtitle">点击一条课次，在右侧处理该节课的学生消课。</div>
              </div>
              <a-tag color="arcoblue">{{ pagination.total }} 条</a-tag>
            </div>

            <a-table
              row-key="id"
              :data="lessonList"
              :loading="listLoading"
              :pagination="pagination"
              :bordered="{ cell: true }"
              :scroll="{ x: '100%', minWidth: 1180 }"
              :row-class="lessonRowClass"
              @page-change="handlePageChange"
              @page-size-change="handlePageSizeChange"
              @row-click="handleSelectLesson"
            >
              <template #columns>
                <a-table-column title="课次日期" data-index="lessonDate" :width="120" fixed="left" />
                <a-table-column title="时间" :width="140" align="center">
                  <template #cell="{ record }">{{ timeRangeText(record.startTime, record.endTime) }}</template>
                </a-table-column>
                <a-table-column title="课程" :width="140" align="center">
                  <template #cell="{ record }">{{ courseName(record.courseId) }}</template>
                </a-table-column>
                <a-table-column title="班级" :width="140" align="center">
                  <template #cell="{ record }">{{ className(record.classId) }}</template>
                </a-table-column>
                <a-table-column title="学生" :width="140" align="center">
                  <template #cell="{ record }">{{ studentName(record.studentId) }}</template>
                </a-table-column>
                <a-table-column title="教师" :width="140" align="center">
                  <template #cell="{ record }">{{ teacherName(record.teacherId) }}</template>
                </a-table-column>
                <a-table-column title="场地" :width="120" align="center">
                  <template #cell="{ record }">{{ roomName(record.roomId) }}</template>
                </a-table-column>
                <a-table-column title="状态" :width="100" align="center">
                  <template #cell="{ record }">
                    <a-tag :color="lessonTagColor(record.status)">{{ lessonStatusText(record.status) }}</a-tag>
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="100" align="center" fixed="right">
                  <template #cell="{ record }">
                    <a-button type="text" @click.stop="handleSelectLesson(record)">
                      {{ record.status === "completed" || record.status === "canceled" || record.status === "stopped" ? "查看" : "处理" }}
                    </a-button>
                  </template>
                </a-table-column>
                <a-table-column title="备注" data-index="remark" :width="200" ellipsis tooltip />
              </template>
            </a-table>
          </section>

          <section v-if="!isMobile || mobileDetailVisible" class="panel panel--detail">
            <template v-if="detailReady">
              <div class="panel__head">
                <div>
                  <div class="panel__title">学生消课处理</div>
                  <div class="panel__subtitle">支持异常单独处理、批量已上课、撤销单人消课与整节完成。</div>
                </div>
                <a-space wrap>
                  <a-button v-if="isMobile" size="small" @click="closeMobileDetail">返回列表</a-button>
                  <a-tag :color="readonlyLesson ? 'gray' : 'green'">{{ readonlyLesson ? "只读态" : "可编辑" }}</a-tag>
                  <a-tag color="arcoblue">{{ completionSummaryText }}</a-tag>
                </a-space>
              </div>

              <a-card class="detail-lesson-card" :bordered="false">
                <div class="detail-lesson-card__title">{{ selectedLessonLabel }}</div>
                <div class="detail-lesson-card__meta">
                  <span>课程：{{ courseName(selectedLesson?.courseId) }}</span>
                  <span>班级：{{ className(selectedLesson?.classId) }}</span>
                  <span>教师：{{ teacherName(selectedLesson?.teacherId) }}</span>
                  <span>场地：{{ roomName(selectedLesson?.roomId) }}</span>
                </div>
                <div class="detail-lesson-card__remark">{{ selectedLesson?.remark || "暂无备注" }}</div>
              </a-card>

              <div class="action-bar">
                <a-space wrap>
                  <a-button type="primary" @click="markAllAttended" :loading="actionLoading" :disabled="!canBatchAttend || readonlyLesson" v-hasPerm="['edu:lessonCompletion:submit']">
                    一键已上课
                  </a-button>
                  <a-button type="primary" status="success" @click="completeLesson" :loading="actionLoading" :disabled="!canCompleteLesson" v-hasPerm="['edu:lessonCompletion:complete']">
                    整节课完成
                  </a-button>
                </a-space>
                <a-tag v-if="unprocessedCount > 0" color="orange">还有 {{ unprocessedCount }} 名学生未处理</a-tag>
                <a-tag v-else color="green">全部学生已处理</a-tag>
              </div>

              <div class="student-filter-bar">
                <a-radio-group v-model="studentFilterMode" type="button">
                  <a-radio value="all">全部学生</a-radio>
                  <a-radio value="pending">仅待处理</a-radio>
                  <a-radio value="abnormal">仅异常结果</a-radio>
                </a-radio-group>
              </div>

              <a-alert v-if="readonlyLesson" type="warning" :show-icon="true">
                当前课次已进入只读态，无法继续提交、撤销或完成。
              </a-alert>

              <a-empty v-if="filteredStudentRows.length === 0" description="当前筛选条件下没有学生" />

              <div v-else class="student-grid">
                <article
                  v-for="student in filteredStudentRows"
                  :key="student.studentId"
                  class="student-card"
                  :class="{ 'is-processed': student.processed, 'is-selected': student.studentId === activeStudentId }"
                  @click="activeStudentId = student.studentId"
                >
                  <div class="student-card__head">
                    <div>
                      <div class="student-card__name">{{ studentName(student.studentId) }}</div>
                      <div class="student-card__meta">学生ID：{{ student.studentId }}</div>
                    </div>
                    <a-tag :color="student.processed ? 'green' : 'orange'">{{ student.processed ? "已处理" : "待处理" }}</a-tag>
                  </div>

                  <div class="student-card__body">
                    <div class="student-card__line">
                      <span class="student-card__label">结果</span>
                      <span class="student-card__value">{{ completionResultText(student.completion?.resultType) }}</span>
                    </div>
                    <div class="student-card__line">
                      <span class="student-card__label">状态</span>
                      <span class="student-card__value">{{ completionStatusText(student.completion?.status) }}</span>
                    </div>
                    <div class="student-card__line">
                      <span class="student-card__label">原因</span>
                      <span class="student-card__value">{{ student.completion?.reason || "未填写" }}</span>
                    </div>
                  </div>

                  <div class="student-card__footer" @click.stop>
                    <a-select
                      v-model="studentFormMap[student.studentId].resultType"
                      placeholder="选择结果"
                      allow-clear
                      :disabled="readonlyLesson"
                      style="width: 100%"
                    >
                      <a-option v-for="item in completionResultOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                    </a-select>
                    <a-input
                      v-model="studentFormMap[student.studentId].reason"
                      placeholder="异常原因 / 备注"
                      allow-clear
                      :disabled="readonlyLesson"
                    />
                    <a-space wrap>
                      <a-button
                        type="primary"
                        size="small"
                        @click="submitStudent(student.studentId)"
                        :loading="actionLoading === `submit-${student.studentId}`"
                        :disabled="readonlyLesson || !canSubmitStudent(student)"
                        v-hasPerm="['edu:lessonCompletion:submit']"
                      >
                        提交
                      </a-button>
                      <a-button
                        size="small"
                        @click="revokeStudent(student.studentId)"
                        :loading="actionLoading === `revoke-${student.studentId}`"
                        :disabled="readonlyLesson || !canRevokeStudent(student)"
                        v-hasPerm="['edu:lessonCompletion:revoke']"
                      >
                        撤销
                      </a-button>
                      <a-button size="small" @click="fillAttended(student.studentId)" :disabled="readonlyLesson || student.processed">
                        设为已上课
                      </a-button>
                    </a-space>
                  </div>
                </article>
              </div>
            </template>

            <a-empty v-else description="请选择左侧一条课次开始处理" />
          </section>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import { getEduLessonListAPI, type EduLessonItem } from "@/api/edu/schedule";
import { getEduClassListAPI, type EduClassItem } from "@/api/edu/class";
import { getEduCourseOptionsAPI, type EduCourseOptionItem } from "@/api/edu/course";
import {
  completeEduLessonAPI,
  getEduLessonCompletionStatusAPI,
  revokeEduLessonCompletionAPI,
  submitEduLessonCompletionsAPI,
  type EduLessonCompletionStatusItem,
  type EduLessonCompletionStudentStatusItem,
  type EduLessonCompletionSubmitItemParams,
  type EduLessonCompletionResultType,
} from "@/api/edu/lesson-completion";
import { getEduRoomOptionsAPI, type EduRoomOptionItem } from "@/api/edu/room";
import { getEduStudentListAPI, type EduStudentItem } from "@/api/edu/student";
import { getEduClassTeacherOptionsAPI, type EduTeacherOptionItem } from "@/api/edu/class";
import { lessonStatusOptions, labelOf } from "../components/options";

const { isMobile } = useDevicesSize();

const completionResultOptions = [
  { label: "已上课", value: "attended" },
  { label: "学生请假", value: "student_leave" },
  { label: "学生旷课", value: "student_absent" },
  { label: "教师停课", value: "teacher_stopped" },
  { label: "机构取消", value: "institution_canceled" },
  { label: "补课已补", value: "makeup_completed" },
] as const;

const completionStatusOptions = [
  { label: "已完成", value: "completed" },
  { label: "欠费", value: "arrears" },
  { label: "已撤销", value: "revoked" },
] as const;

const searchForm = reactive<{
  status?: string;
  classId?: number;
  studentId?: number;
  teacherId?: number;
}>({});
const lessonList = ref<EduLessonItem[]>([]);
const courseOptions = ref<EduCourseOptionItem[]>([]);
const classOptions = ref<EduClassItem[]>([]);
const studentOptions = ref<EduStudentItem[]>([]);
const teacherOptions = ref<EduTeacherOptionItem[]>([]);
const roomOptions = ref<EduRoomOptionItem[]>([]);
const listLoading = ref(false);
const statusLoading = ref(false);
const actionLoading = ref<string | boolean>(false);
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const selectedLesson = ref<EduLessonItem | null>(null);
const statusDetail = ref<EduLessonCompletionStatusItem | null>(null);
const activeStudentId = ref<number | null>(null);
const mobileDetailVisible = ref(false);
const studentFilterMode = ref<"all" | "pending" | "abnormal">("all");
const studentFormMap = reactive<Record<number, { resultType?: EduLessonCompletionResultType; reason: string }>>({});

const selectedLessonLabel = computed(() => {
  if (!selectedLesson.value) return "-";
  return `${selectedLesson.value.lessonDate || "-"} ${timeRangeText(selectedLesson.value.startTime, selectedLesson.value.endTime)}`;
});

const studentRows = computed(() => statusDetail.value?.students || []);
const filteredStudentRows = computed(() => {
  if (studentFilterMode.value === "pending") {
    return studentRows.value.filter((item) => !item.processed || item.completion?.status === "revoked");
  }
  if (studentFilterMode.value === "abnormal") {
    return studentRows.value.filter((item) => {
      const resultType = item.completion?.resultType;
      return !!resultType && resultType !== "attended";
    });
  }
  return studentRows.value;
});
const unprocessedCount = computed(() => statusDetail.value?.unprocessedCount ?? 0);
const processedCount = computed(() => studentRows.value.filter((item) => item.processed).length);
const selectedLessonSummary = computed(() => ({
  processedCount: processedCount.value,
  unprocessedCount: unprocessedCount.value,
}));
const detailReady = computed(() => !!selectedLesson.value && !!statusDetail.value);
const readonlyLesson = computed(() => {
  const status = selectedLesson.value?.status;
  return status === "completed" || status === "canceled" || status === "stopped";
});
const canBatchAttend = computed(() => detailReady.value && !readonlyLesson.value && unprocessedCount.value > 0);
const canCompleteLesson = computed(() => detailReady.value && !readonlyLesson.value && unprocessedCount.value === 0);
const completionSummaryText = computed(() => {
  const total = studentRows.value.length;
  return `${processedCount.value}/${total} 已处理`;
});

const courseName = (id?: string | number) => courseOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const className = (id?: string | number) => classOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const studentName = (id?: string | number) => studentOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const teacherName = (id?: string | number) => {
  const item = teacherOptions.value.find((option) => String(option.id) === String(id));
  return item ? item.nickName || item.name || item.username || String(item.id) : "-";
};
const roomName = (id?: string | number) => roomOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";

function timeRangeText(startTime?: string, endTime?: string) {
  if (!startTime && !endTime) return "-";
  return `${startTime || "--:--"} ~ ${endTime || "--:--"}`;
}

function lessonStatusText(status?: string) {
  return labelOf(lessonStatusOptions, status);
}

function lessonTagColor(status?: string) {
  if (status === "completed") return "green";
  if (status === "canceled") return "red";
  if (status === "stopped") return "orange";
  return "arcoblue";
}

function completionResultText(value?: string) {
  return labelOf(completionResultOptions as unknown as Array<{ label: string; value: string }>, value);
}

function completionStatusText(value?: string) {
  return labelOf(completionStatusOptions as unknown as Array<{ label: string; value: string }>, value);
}

function optionalIdValue(value?: string | number) {
  return value === undefined || value === null ? undefined : String(value);
}

function lessonRowClass(record: EduLessonItem) {
  return selectedLesson.value?.id === record.id ? "is-active-lesson" : "";
}

function syncStudentForm(rows: EduLessonCompletionStudentStatusItem[]) {
  rows.forEach((item) => {
    if (!studentFormMap[item.studentId]) {
      studentFormMap[item.studentId] = { resultType: "attended", reason: "" };
    }
    if (item.completion?.resultType && !studentFormMap[item.studentId].resultType) {
      studentFormMap[item.studentId].resultType = item.completion.resultType as EduLessonCompletionResultType;
    }
    if (item.completion?.reason && !studentFormMap[item.studentId].reason) {
      studentFormMap[item.studentId].reason = item.completion.reason;
    }
  });
}

async function fetchLessons() {
  listLoading.value = true;
  try {
    const res = await getEduLessonListAPI({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      status: searchForm.status,
      classId: optionalIdValue(searchForm.classId),
      studentId: optionalIdValue(searchForm.studentId),
      teacherId: optionalIdValue(searchForm.teacherId),
    });
    lessonList.value = res.data.list || [];
    pagination.total = res.data.total || 0;
    if (!selectedLesson.value && lessonList.value.length > 0) {
      await selectLesson(lessonList.value[0]);
    }
    if (selectedLesson.value) {
      const matched = lessonList.value.find((item) => item.id === selectedLesson.value?.id);
      if (matched) {
        selectedLesson.value = matched;
      } else {
        selectedLesson.value = null;
        statusDetail.value = null;
        activeStudentId.value = null;
        mobileDetailVisible.value = false;
      }
    }
  } finally {
    listLoading.value = false;
  }
}

async function fetchOptions() {
  const [courses, classes, students, teachers, rooms] = await Promise.all([
    getEduCourseOptionsAPI(),
    getEduClassListAPI({ pageNum: 1, pageSize: 500 }),
    getEduStudentListAPI({ pageNum: 1, pageSize: 500 }),
    getEduClassTeacherOptionsAPI(),
    getEduRoomOptionsAPI(),
  ]);
  courseOptions.value = courses.data.list || [];
  classOptions.value = classes.data.list || [];
  studentOptions.value = students.data.list || [];
  teacherOptions.value = teachers.data.list || [];
  roomOptions.value = rooms.data.list || [];
}

async function fetchStatus(lessonId: number | string) {
  statusLoading.value = true;
  try {
    const res = await getEduLessonCompletionStatusAPI(lessonId);
    statusDetail.value = res.data || null;
    syncStudentForm(statusDetail.value?.students || []);
    if (!activeStudentId.value) {
      activeStudentId.value = statusDetail.value?.students?.[0]?.studentId ?? null;
    }
  } finally {
    statusLoading.value = false;
  }
}

async function selectLesson(record: EduLessonItem) {
  selectedLesson.value = record;
  activeStudentId.value = null;
  studentFilterMode.value = "all";
  if (isMobile.value) {
    mobileDetailVisible.value = true;
  }
  await fetchStatus(record.id);
}

function handleSelectLesson(record: EduLessonItem) {
  void selectLesson(record);
}

function handleSearch() {
  pagination.current = 1;
  void fetchLessons();
}

function handleReset() {
  Object.assign(searchForm, { status: undefined, classId: undefined, studentId: undefined, teacherId: undefined });
  pagination.current = 1;
  void fetchLessons();
}

function closeMobileDetail() {
  mobileDetailVisible.value = false;
}

function handlePageChange(page: number) {
  pagination.current = page;
  void fetchLessons();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.current = 1;
  void fetchLessons();
}

function canSubmitStudent(student: EduLessonCompletionStudentStatusItem) {
  return !readonlyLesson.value && (!student.processed || student.completion?.status === "revoked");
}

function canRevokeStudent(student: EduLessonCompletionStudentStatusItem) {
  return !readonlyLesson.value && !!student.completion && student.completion.status !== "revoked";
}

function fillAttended(studentId: number) {
  studentFormMap[studentId] ||= { resultType: "attended", reason: "" };
  studentFormMap[studentId].resultType = "attended";
}

async function submitStudent(studentId: number) {
  const current = studentFormMap[studentId];
  if (!selectedLesson.value) return;
  if (!current?.resultType) {
    Message.warning("请选择消课结果");
    return;
  }
  actionLoading.value = `submit-${studentId}`;
  try {
    const payload: EduLessonCompletionSubmitItemParams = {
      studentId,
      resultType: current.resultType,
      reason: current.reason || undefined,
    };
    await submitEduLessonCompletionsAPI(selectedLesson.value.id, { lessonId: selectedLesson.value.id, items: [payload] });
    Message.success("学生消课已提交");
    await fetchStatus(selectedLesson.value.id);
    await fetchLessons();
  } finally {
    actionLoading.value = false;
  }
}

async function markAllAttended() {
  if (!selectedLesson.value || !statusDetail.value) return;
  const items = statusDetail.value.students
    .filter((student) => !student.processed || student.completion?.status === "revoked")
    .map((student) => ({
      studentId: student.studentId,
      resultType: "attended" as EduLessonCompletionResultType,
      reason: studentFormMap[student.studentId]?.reason || undefined,
    }));
  if (items.length === 0) {
    Message.info("没有需要补充已上课的学生");
    return;
  }
  actionLoading.value = true;
  try {
    await submitEduLessonCompletionsAPI(selectedLesson.value.id, { lessonId: selectedLesson.value.id, items });
    Message.success("已批量标记为已上课");
    await fetchStatus(selectedLesson.value.id);
    await fetchLessons();
  } finally {
    actionLoading.value = false;
  }
}

async function revokeStudent(studentId: number) {
  if (!selectedLesson.value) return;
  const reason = studentFormMap[studentId]?.reason?.trim();
  if (!reason) {
    Message.warning("请先填写撤销原因");
    return;
  }
  actionLoading.value = `revoke-${studentId}`;
  try {
    await revokeEduLessonCompletionAPI(selectedLesson.value.id, studentId, { reason });
    Message.success("已撤销该学生消课");
    await fetchStatus(selectedLesson.value.id);
    await fetchLessons();
  } finally {
    actionLoading.value = false;
  }
}

async function completeLesson() {
  if (!selectedLesson.value) return;
  actionLoading.value = true;
  try {
    await completeEduLessonAPI(selectedLesson.value.id, { lessonId: selectedLesson.value.id, reason: "学生消课全部处理完成" });
    Message.success("整节课已完成");
    await fetchStatus(selectedLesson.value.id);
    await fetchLessons();
  } finally {
    actionLoading.value = false;
  }
}

onMounted(async () => {
  await fetchOptions();
  await fetchLessons();
});
</script>

<style scoped>
.lesson-completion-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-completion-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.16), transparent 28%),
    linear-gradient(135deg, #0f172a 0%, #164e63 48%, #2563eb 100%);
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.16);
}

.lesson-completion-hero__tag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 4px 10px;
  margin-bottom: 10px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.14);
}

.lesson-completion-hero__title {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}

.lesson-completion-hero__subtitle {
  max-width: 680px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.7;
}

.lesson-completion-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(100px, 1fr));
  gap: 12px;
}

.hero-stat {
  min-width: 110px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
}

.hero-stat__value {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
}

.hero-stat__label {
  margin-top: 4px;
  color: #64748b;
}

.lesson-completion-shell {
  width: 100%;
}

.lesson-completion-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 16px;
  align-items: start;
}

.panel {
  min-width: 0;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.panel__subtitle {
  margin-top: 4px;
  color: #64748b;
  line-height: 1.6;
}

.panel--lessons :deep(.arco-table-tr.is-active-lesson td) {
  background: rgba(37, 99, 235, 0.08);
}

.panel--detail {
  position: sticky;
  top: 16px;
}

.detail-lesson-card {
  margin-bottom: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.05), rgba(37, 99, 235, 0.06));
}

.detail-lesson-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.detail-lesson-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 8px;
  color: #334155;
}

.detail-lesson-card__remark {
  margin-top: 10px;
  color: #64748b;
  line-height: 1.7;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.student-filter-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.student-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #fff;
  transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  cursor: pointer;
}

.student-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

.student-card.is-selected {
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.09);
}

.student-card.is-processed {
  background: linear-gradient(180deg, #ffffff 0%, rgba(34, 197, 94, 0.04) 100%);
}

.student-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.student-card__name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.student-card__meta {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}

.student-card__body {
  display: grid;
  gap: 8px;
}

.student-card__line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.student-card__label {
  color: #64748b;
}

.student-card__value {
  color: #0f172a;
  text-align: right;
}

.student-card__footer {
  display: grid;
  gap: 8px;
}

:deep(.arco-table-container) {
  overflow: auto;
}

@media (max-width: 1024px) {
  .lesson-completion-layout {
    grid-template-columns: 1fr;
  }

  .panel--detail {
    position: static;
  }

  .student-grid {
    grid-template-columns: 1fr;
  }

  .lesson-completion-hero {
    grid-template-columns: 1fr;
  }

  .lesson-completion-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .lesson-completion-hero {
    padding: 18px;
  }

  .lesson-completion-hero__title {
    font-size: 24px;
  }

  .lesson-completion-hero__stats {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 14px;
  }
}
</style>
