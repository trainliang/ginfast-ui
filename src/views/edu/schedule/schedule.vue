<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="rules" title="排课规则">
          <s-layout-tools>
            <template #left>
              <a-space wrap>
                <a-input v-model="ruleSearchForm.name" placeholder="规则名称" allow-clear />
                <a-select v-model="ruleSearchForm.ruleType" placeholder="规则类型" allow-clear style="width: 140px">
                  <a-option v-for="item in scheduleRuleTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                </a-select>
                <a-select v-model="ruleSearchForm.repeatType" placeholder="重复方式" allow-clear style="width: 140px">
                  <a-option v-for="item in scheduleRepeatTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                </a-select>
                <a-select v-model="ruleSearchForm.status" placeholder="状态" allow-clear style="width: 110px">
                  <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                </a-select>
                <a-button type="primary" @click="handleRuleSearch"><template #icon><icon-search /></template>查询</a-button>
                <a-button @click="handleRuleReset"><template #icon><icon-refresh /></template>重置</a-button>
              </a-space>
            </template>
            <template #right>
              <a-button type="primary" @click="handleCreateRule" v-hasPerm="['edu:scheduleRule:add']">
                <template #icon><icon-plus /></template>
                新增规则
              </a-button>
            </template>
          </s-layout-tools>

          <a-table
            row-key="id"
            :data="ruleList"
            :loading="ruleLoading"
            :pagination="rulePagination"
            :bordered="{ cell: true }"
            :scroll="{ x: '100%', minWidth: 1350 }"
            @page-change="handleRulePageChange"
            @page-size-change="handleRulePageSizeChange"
          >
            <template #columns>
              <a-table-column title="规则名称" data-index="name" :width="160" fixed="left" ellipsis tooltip />
              <a-table-column title="规则类型" :width="120" align="center">
                <template #cell="{ record }">{{ labelOf(scheduleRuleTypeOptions, record.ruleType) }}</template>
              </a-table-column>
              <a-table-column title="重复方式" :width="120" align="center">
                <template #cell="{ record }">{{ labelOf(scheduleRepeatTypeOptions, record.repeatType) }}</template>
              </a-table-column>
              <a-table-column title="学期" :width="120" align="center">
                <template #cell="{ record }">{{ termName(record.termId) }}</template>
              </a-table-column>
              <a-table-column title="日期范围" :width="180">
                <template #cell="{ record }">{{ dateRangeText(record.startDate, record.endDate) }}</template>
              </a-table-column>
              <a-table-column title="星期" :width="120" align="center">
                <template #cell="{ record }">{{ weekdaysText(record.weekdays) }}</template>
              </a-table-column>
              <a-table-column title="时间" :width="140" align="center">
                <template #cell="{ record }">{{ timeRangeText(record.startTime, record.endTime) }}</template>
              </a-table-column>
              <a-table-column title="课程" :width="120" align="center">
                <template #cell="{ record }">{{ courseName(record.courseId) }}</template>
              </a-table-column>
              <a-table-column title="教师" :width="120" align="center">
                <template #cell="{ record }">{{ teacherName(record.teacherId) }}</template>
              </a-table-column>
              <a-table-column title="班级/学生" :width="140" ellipsis tooltip>
                <template #cell="{ record }">{{ targetText(record) }}</template>
              </a-table-column>
              <a-table-column title="状态" :width="90" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ labelOf(statusOptions, record.status) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="160" align="center">
                <template #cell="{ record }">
                  <a-space>
                    <a-link @click="handleEditRule(record)" v-hasPerm="['edu:scheduleRule:edit']">编辑</a-link>
                    <a-popconfirm content="确定删除该规则吗？" @ok="handleDeleteRule(record.id)">
                      <a-link status="danger" v-hasPerm="['edu:scheduleRule:delete']">删除</a-link>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="lessons" title="课次列表">
          <s-layout-tools>
            <template #left>
              <a-space wrap>
                <a-select v-model="lessonSearchForm.status" placeholder="课次状态" allow-clear style="width: 130px">
                  <a-option v-for="item in lessonStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                </a-select>
                <a-select v-model="lessonSearchForm.classId" placeholder="班级" allow-clear style="width: 160px">
                  <a-option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
                </a-select>
                <a-select v-model="lessonSearchForm.studentId" placeholder="学生" allow-clear allow-search style="width: 160px">
                  <a-option v-for="item in studentOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
                </a-select>
                <a-select v-model="lessonSearchForm.teacherId" placeholder="教师" allow-clear style="width: 160px">
                  <a-option v-for="item in teacherOptions" :key="item.id" :value="item.id">{{ teacherLabel(item) }}</a-option>
                </a-select>
                <a-button type="primary" @click="handleLessonSearch"><template #icon><icon-search /></template>查询</a-button>
                <a-button @click="handleLessonReset"><template #icon><icon-refresh /></template>重置</a-button>
              </a-space>
            </template>
            <template #right>
              <a-tag color="arcoblue">保存前冲突校验</a-tag>
              <a-tag color="orange">变更预览</a-tag>
            </template>
          </s-layout-tools>

          <a-table
            row-key="id"
            :data="lessonList"
            :loading="lessonLoading"
            :pagination="lessonPagination"
            :bordered="{ cell: true }"
            :scroll="{ x: '100%', minWidth: 1300 }"
            @page-change="handleLessonPageChange"
            @page-size-change="handleLessonPageSizeChange"
          >
            <template #columns>
              <a-table-column title="课次日期" data-index="lessonDate" :width="120" fixed="left" />
              <a-table-column title="课次类型" :width="100" align="center">
                <template #cell="{ record }">{{ record.classId ? "班课" : record.studentId ? "一对一" : "-" }}</template>
              </a-table-column>
              <a-table-column title="时间" :width="140" align="center">
                <template #cell="{ record }">{{ timeRangeText(record.startTime, record.endTime) }}</template>
              </a-table-column>
              <a-table-column title="课程" :width="120" align="center">
                <template #cell="{ record }">{{ courseName(record.courseId) }}</template>
              </a-table-column>
              <a-table-column title="班级" :width="120" align="center">
                <template #cell="{ record }">{{ className(record.classId) }}</template>
              </a-table-column>
              <a-table-column title="学生" :width="120" align="center">
                <template #cell="{ record }">{{ studentName(record.studentId) }}</template>
              </a-table-column>
              <a-table-column title="教师" :width="120" align="center">
                <template #cell="{ record }">{{ teacherName(record.teacherId) }}</template>
              </a-table-column>
              <a-table-column title="场地" :width="120" align="center">
                <template #cell="{ record }">{{ roomName(record.roomId) }}</template>
              </a-table-column>
              <a-table-column title="状态" :width="90" align="center">
                <template #cell="{ record }">{{ labelOf(lessonStatusOptions, record.status) }}</template>
              </a-table-column>
              <a-table-column title="备注" data-index="remark" :width="180" ellipsis tooltip />
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="calendar" title="课表日历">
          <s-layout-tools>
            <template #left>
              <a-space wrap>
                <a-radio-group v-model="calendarView" type="button">
                  <a-radio v-for="item in calendarViewOptions" :key="item.value" :value="item.value">{{ item.label }}</a-radio>
                </a-radio-group>
                <a-select v-model="calendarSearchForm.teacherId" placeholder="教师" allow-clear style="width: 160px">
                  <a-option v-for="item in teacherOptions" :key="item.id" :value="item.id">{{ teacherLabel(item) }}</a-option>
                </a-select>
                <a-select v-model="calendarSearchForm.roomId" placeholder="场地" allow-clear style="width: 160px">
                  <a-option v-for="item in roomOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
                </a-select>
                <a-select v-model="calendarSearchForm.classId" placeholder="班级" allow-clear style="width: 160px">
                  <a-option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
                </a-select>
                <a-select v-model="calendarSearchForm.studentId" placeholder="学生" allow-clear allow-search style="width: 160px">
                  <a-option v-for="item in studentOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
                </a-select>
                <a-button type="primary" @click="handleCalendarSearch"><template #icon><icon-search /></template>查询</a-button>
                <a-button @click="handleCalendarReset"><template #icon><icon-refresh /></template>重置</a-button>
              </a-space>
            </template>
            <template #right>
              <a-tag color="arcoblue">日程预览</a-tag>
              <a-tag color="purple">课次详情</a-tag>
            </template>
          </s-layout-tools>

          <div class="calendar-shell">
            <div class="calendar-grid">
              <button
                v-for="record in pagedCalendarList"
                :key="record.id"
                class="calendar-card"
                type="button"
                @click="openLessonDrawer(record)"
              >
                <div class="calendar-card__day">{{ calendarCardDay(record.lessonDate) }}</div>
                <div class="calendar-card__date">{{ record.lessonDate || "-" }}</div>
                <div class="calendar-card__time">{{ timeRangeText(record.startTime, record.endTime) }}</div>
                <div class="calendar-card__meta">{{ courseName(record.courseId) }}</div>
                <div class="calendar-card__meta">{{ teacherName(record.teacherId) }}</div>
                <a-tag size="small" color="arcoblue">{{ labelOf(lessonStatusOptions, record.status) }}</a-tag>
              </button>
            </div>
            <a-empty v-if="!calendarLoading && calendarList.length === 0" description="当前筛选条件下暂无课次" />
            <div class="calendar-footer">
              <a-pagination
                :current="calendarPagination.current"
                :page-size="calendarPagination.pageSize"
                :total="calendarPagination.total"
                show-total
                show-page-size
                @change="handleCalendarPageChange"
                @page-size-change="handleCalendarPageSizeChange"
              />
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <a-modal
      v-model:visible="ruleModalVisible"
      :title="ruleForm.id ? '编辑排课规则' : '新增排课规则'"
      :width="layoutMode.width"
      :on-before-ok="handleSaveRule"
      @cancel="resetRuleForm"
      @close="resetRuleForm"
    >
      <a-form ref="ruleFormRef" :model="ruleForm" :rules="ruleRules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="规则名称"><a-input v-model="ruleForm.name" allow-clear /></a-form-item>
        <a-form-item field="ruleType" label="规则类型">
          <a-select v-model="ruleForm.ruleType" placeholder="请选择规则类型" @change="handleRuleTypeChange">
            <a-option v-for="item in scheduleRuleTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="repeatType" label="重复方式">
          <a-select v-model="ruleForm.repeatType" placeholder="请选择重复方式">
            <a-option v-for="item in scheduleRepeatTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="termId" label="学期">
          <a-select v-model="ruleForm.termId" allow-clear placeholder="选择学期">
            <a-option v-for="item in termOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="startDate" label="开始日期"><a-date-picker v-model="ruleForm.startDate" value-format="YYYY-MM-DD" style="width: 100%" /></a-form-item>
        <a-form-item field="endDate" label="结束日期"><a-date-picker v-model="ruleForm.endDate" value-format="YYYY-MM-DD" style="width: 100%" /></a-form-item>
        <a-form-item v-if="ruleForm.repeatType === 'weekly'" field="weekdays" label="星期">
          <a-select v-model="ruleForm.weekdays" placeholder="请选择星期" allow-clear multiple>
            <a-option v-for="item in weekdayOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="startTime" label="开始时间"><a-time-picker v-model="ruleForm.startTime" value-format="HH:mm" format="HH:mm" style="width: 100%" /></a-form-item>
        <a-form-item field="endTime" label="结束时间"><a-time-picker v-model="ruleForm.endTime" value-format="HH:mm" format="HH:mm" style="width: 100%" /></a-form-item>
        <a-form-item v-if="showClassField" field="classId" label="班级">
          <a-select v-model="ruleForm.classId" placeholder="请选择班级" allow-clear>
            <a-option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="showStudentField" field="studentId" label="学生">
          <a-select v-model="ruleForm.studentId" placeholder="请选择学生" allow-clear allow-search>
            <a-option v-for="item in studentOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="courseId" label="课程">
          <a-select v-model="ruleForm.courseId" placeholder="请选择课程" allow-clear>
            <a-option v-for="item in courseOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="teacherId" label="教师">
          <a-select v-model="ruleForm.teacherId" placeholder="请选择教师" allow-clear>
            <a-option v-for="item in teacherOptions" :key="item.id" :value="item.id">{{ teacherLabel(item) }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="teachingMode" label="授课方式">
          <a-select v-model="ruleForm.teachingMode" placeholder="请选择授课方式" allow-clear>
            <a-option v-for="item in teachingModeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="requiresRoom" label="是否需要场地">
          <a-radio-group v-model="ruleForm.requiresRoom">
            <a-radio v-for="item in requiresRoomOptions" :key="item.value" :value="item.value">{{ item.label }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="roomId" label="场地">
          <a-select v-model="ruleForm.roomId" placeholder="请选择场地" allow-clear :disabled="ruleForm.requiresRoom === 0">
            <a-option v-for="item in roomOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="ruleForm.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="remark" label="备注"><a-textarea v-model="ruleForm.remark" placeholder="请输入备注" /></a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="lessonDrawerVisible" title="课次详情" :width="isMobile ? '100%' : 560" :footer="false">
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="课次日期">{{ selectedLesson.lessonDate || "-" }}</a-descriptions-item>
        <a-descriptions-item label="时间">{{ timeRangeText(selectedLesson.startTime, selectedLesson.endTime) }}</a-descriptions-item>
        <a-descriptions-item label="课次类型">{{ lessonTypeText(selectedLesson) }}</a-descriptions-item>
        <a-descriptions-item label="课程">{{ courseName(selectedLesson.courseId) }}</a-descriptions-item>
        <a-descriptions-item label="教师">{{ teacherName(selectedLesson.teacherId) }}</a-descriptions-item>
        <a-descriptions-item label="班级">{{ className(selectedLesson.classId) }}</a-descriptions-item>
        <a-descriptions-item label="学生">{{ studentName(selectedLesson.studentId) }}</a-descriptions-item>
        <a-descriptions-item label="授课方式">{{ labelOf(teachingModeOptions, selectedLesson.teachingMode) }}</a-descriptions-item>
        <a-descriptions-item label="场地">{{ roomName(selectedLesson.roomId) }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ labelOf(lessonStatusOptions, selectedLesson.status) }}</a-descriptions-item>
        <a-descriptions-item label="备注">
          <span :class="{ 'color-text-3': !selectedLesson.remark }">{{ selectedLesson.remark || "无" }}</span>
        </a-descriptions-item>
      </a-descriptions>

      <a-space wrap style="margin-top: 16px">
        <a-button v-if="canReschedule" type="primary" @click="handleLessonAction('reschedule')">调课</a-button>
        <a-button v-if="canStop" status="warning" @click="handleLessonAction('stop')">停课</a-button>
        <a-button v-if="canCancel" status="danger" @click="handleLessonAction('cancel')">取消</a-button>
        <a-button v-if="canRestore" type="primary" @click="handleLessonAction('restore')">恢复</a-button>
        <a-button v-if="canMakeup" type="primary" @click="handleLessonAction('makeup')">补课</a-button>
        <a-button @click="handleLessonAction('history')">变更历史</a-button>
      </a-space>

      <div v-if="loadingHistory" style="margin-top: 16px; text-align: center">
        <a-spin />
      </div>

      <div class="lesson-history" v-if="lessonHistoryRows.length > 0">
        <a-divider />
        <div class="lesson-history__title">
          <icon-history />
          变更历史
        </div>
        <a-timeline>
          <a-timeline-item v-for="item in lessonHistoryRows" :key="item.id">
            <div class="lesson-history__item">
              <strong>{{ actionTypeLabel(item.actionType) }}</strong>
              <span>{{ item.occurredAt || item.createdAt || "-" }}</span>
            </div>
            <div class="lesson-history__reason">{{ item.reason || "无原因" }}</div>
          </a-timeline-item>
        </a-timeline>
      </div>
      <a-empty v-else-if="!loadingHistory && lessonDrawerVisible" description="暂无变更历史" style="margin-top: 16px" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { Modal, Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import type { TableData } from "@arco-design/web-vue/es/table/interface";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import {
  addEduScheduleRuleAPI,
  checkEduScheduleConflictsAPI,
  deleteEduScheduleRuleAPI,
  getEduLessonCalendarAPI,
  editEduScheduleRuleAPI,
  getEduLessonListAPI,
  getEduScheduleRuleListAPI,
  previewEduScheduleRuleChangeAPI,
  rescheduleEduLessonAPI,
  stopEduLessonAPI,
  cancelEduLessonAPI,
  restoreEduLessonAPI,
  makeupEduLessonAPI,
  getEduLessonChangeLogsAPI,
  type EduCourseOptionItem,
  type EduLessonChangeLogItem,
  type EduLessonItem,
  type EduLessonMakeupParams,
  type EduLessonRescheduleParams,
  type EduLessonStatusActionParams,
  type EduRoomOptionItem,
  type EduScheduleRuleAddParams,
  type EduScheduleRuleItem,
  type EduScheduleRuleListParams,
  type EduStudentItem,
  type EduTeacherOptionItem,
} from "@/api/edu";
import {
  lessonStatusOptions,
  requiresRoomOptions,
  scheduleRepeatTypeOptions,
  scheduleRuleTypeOptions,
  statusOptions,
  teachingModeOptions,
  weekdayOptions,
  labelOf,
} from "../components/options";
import { getEduClassListAPI, getEduCourseOptionsAPI, getEduRoomOptionsAPI, getEduStudentListAPI, getEduClassTeacherOptionsAPI, type EduClassItem } from "@/api/edu";
import { getEduTermListAPI, type EduTermItem } from "@/api/edu";

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({ width: isMobile.value ? "95%" : "820px", layout: isMobile.value ? "vertical" : "horizontal" }));

const activeTab = ref("rules");
const ruleLoading = ref(false);
const ruleList = ref<EduScheduleRuleItem[]>([]);
const ruleSearchForm = reactive<EduScheduleRuleListParams>({});
const rulePagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const lessonLoading = ref(false);
const lessonList = ref<EduLessonItem[]>([]);
const lessonSearchForm = reactive<{ status?: string; classId?: string; studentId?: string; teacherId?: string }>({});
const lessonPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const calendarView = ref("week");
const calendarViewOptions = [
  { label: "日视图", value: "day" },
  { label: "周视图", value: "week" },
  { label: "月视图", value: "month" },
];
const calendarLoading = ref(false);
const calendarList = ref<EduLessonItem[]>([]);
const calendarSearchForm = reactive<{ teacherId?: string; roomId?: string; classId?: string; studentId?: string }>({});
const calendarPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const ruleModalVisible = ref(false);
const ruleFormRef = ref();
const emptyRuleForm = (): EduScheduleRuleAddParams & { id?: string } => ({
  name: "",
  ruleType: "class",
  repeatType: "weekly",
  termId: undefined,
  startDate: "",
  endDate: "",
  weekdays: [1],
  startTime: "09:00",
  endTime: "10:00",
  classId: undefined,
  studentId: undefined,
  courseId: undefined,
  teacherId: undefined,
  teachingMode: "",
  requiresRoom: 1,
  roomId: undefined,
  status: 1,
  remark: "",
});
const ruleForm = ref(emptyRuleForm());
const ruleRules: Record<string, any> = {
  name: [{ required: true, message: "请输入规则名称" }],
  ruleType: [{ required: true, message: "请选择规则类型" }],
  repeatType: [{ required: true, message: "请选择重复方式" }],
  weekdays: [
    {
      required: true,
      validator: (value: any, callback: any) => {
        if (ruleForm.value.repeatType === "weekly" && (!value || value.length === 0)) {
          callback("每周重复时必须选择上课日");
        }
        callback();
      },
    },
  ],
  startTime: [{ required: true, message: "请选择开始时间" }],
  endTime: [{ required: true, message: "请选择结束时间" }],
};

const termOptions = ref<EduTermItem[]>([]);
const classOptions = ref<EduClassItem[]>([]);
const courseOptions = ref<EduCourseOptionItem[]>([]);
const teacherOptions = ref<EduTeacherOptionItem[]>([]);
const roomOptions = ref<EduRoomOptionItem[]>([]);
const studentOptions = ref<EduStudentItem[]>([]);

const lessonDrawerVisible = ref(false);
const selectedLesson = ref<EduLessonItem>({ id: "", lessonDate: "", startTime: "", endTime: "" });
const lessonHistoryRows = ref<EduLessonChangeLogItem[]>([]);
const loadingHistory = ref(false);
const pagedCalendarList = computed(() => {
  const start = (calendarPagination.current - 1) * calendarPagination.pageSize;
  const end = start + calendarPagination.pageSize;
  return calendarList.value.slice(start, end);
});

const showClassField = computed(() => ruleForm.value.ruleType === "class");
const showStudentField = computed(() => ruleForm.value.ruleType === "one_to_one");

const canReschedule = computed(() => selectedLesson.value.status === "scheduled");
const canStop = computed(() => selectedLesson.value.status === "scheduled");
const canCancel = computed(() => selectedLesson.value.status === "scheduled");
const canRestore = computed(() => selectedLesson.value.status === "canceled" || selectedLesson.value.status === "stopped");
const canMakeup = computed(() => selectedLesson.value.status === "canceled" || selectedLesson.value.status === "stopped");

const fetchOptions = async () => {
  const [terms, classes, courses, teachers, rooms, students] = await Promise.all([
    getEduTermListAPI({ pageNum: 1, pageSize: 500 }),
    getEduClassListAPI({ pageNum: 1, pageSize: 500 }),
    getEduCourseOptionsAPI(),
    getEduClassTeacherOptionsAPI(),
    getEduRoomOptionsAPI(),
    getEduStudentListAPI({ pageNum: 1, pageSize: 500 }),
  ]);
  termOptions.value = terms.data.list;
  classOptions.value = classes.data.list;
  courseOptions.value = courses.data.list;
  teacherOptions.value = teachers.data.list;
  roomOptions.value = rooms.data.list;
  studentOptions.value = students.data.list;
};

const fetchRuleList = async () => {
  ruleLoading.value = true;
  try {
    const res = await getEduScheduleRuleListAPI({ ...ruleSearchForm, pageNum: rulePagination.current, pageSize: rulePagination.pageSize });
    ruleList.value = res.data.list;
    rulePagination.total = res.data.total;
  } finally {
    ruleLoading.value = false;
  }
};

const fetchLessonList = async () => {
  lessonLoading.value = true;
  try {
    const res = await getEduLessonListAPI({ ...lessonSearchForm, pageNum: lessonPagination.current, pageSize: lessonPagination.pageSize });
    lessonList.value = res.data.list;
    lessonPagination.total = res.data.total;
  } finally {
    lessonLoading.value = false;
  }
};

const fetchCalendarList = async () => {
  calendarLoading.value = true;
  try {
    const res = await getEduLessonCalendarAPI(buildCalendarParams());
    calendarList.value = res.data.list || [];
    calendarPagination.total = calendarList.value.length;
  } finally {
    calendarLoading.value = false;
  }
};

const handleRuleSearch = () => { rulePagination.current = 1; fetchRuleList(); };
const handleRuleReset = () => { Object.assign(ruleSearchForm, { name: undefined, ruleType: undefined, repeatType: undefined, status: undefined }); handleRuleSearch(); };
const handleRulePageChange = (page: number) => { rulePagination.current = page; fetchRuleList(); };
const handleRulePageSizeChange = (pageSize: number) => { rulePagination.pageSize = pageSize; rulePagination.current = 1; fetchRuleList(); };
const handleLessonSearch = () => { lessonPagination.current = 1; fetchLessonList(); };
const handleLessonReset = () => { Object.assign(lessonSearchForm, { status: undefined, classId: undefined, studentId: undefined, teacherId: undefined }); handleLessonSearch(); };
const handleLessonPageChange = (page: number) => { lessonPagination.current = page; fetchLessonList(); };
const handleLessonPageSizeChange = (pageSize: number) => { lessonPagination.pageSize = pageSize; lessonPagination.current = 1; fetchLessonList(); };
const handleCalendarSearch = () => { calendarPagination.current = 1; fetchCalendarList(); };
const handleCalendarReset = () => { Object.assign(calendarSearchForm, { teacherId: undefined, roomId: undefined, classId: undefined, studentId: undefined }); handleCalendarSearch(); };
const handleCalendarPageChange = (page: number) => { calendarPagination.current = page; };
const handleCalendarPageSizeChange = (pageSize: number) => { calendarPagination.pageSize = pageSize; calendarPagination.current = 1; };

const handleCreateRule = () => { ruleForm.value = emptyRuleForm(); ruleModalVisible.value = true; };
const handleEditRule = (record: TableData) => { ruleForm.value = { ...emptyRuleForm(), ...(record as EduScheduleRuleItem) }; ruleModalVisible.value = true; };
const resetRuleForm = () => { ruleFormRef.value?.resetFields?.(); ruleForm.value = emptyRuleForm(); };
const handleRuleTypeChange = () => {
  if (ruleForm.value.ruleType === "class") ruleForm.value.studentId = undefined;
  if (ruleForm.value.ruleType === "one_to_one") ruleForm.value.classId = undefined;
};

const buildRulePayload = () => {
  const payload = { ...ruleForm.value };
  if (payload.ruleType === "class") {
    payload.studentId = undefined;
  }
  if (payload.ruleType === "one_to_one") {
    payload.classId = undefined;
  }
  if (payload.repeatType === "single") {
    payload.weekdays = [];
  }
  if (payload.requiresRoom === 0) {
    payload.roomId = undefined;
  }
  return payload;
};

const buildConflictPayload = () => ({
  lessonId: "0",
  ruleId: ruleForm.value.id,
  lessonDate: ruleForm.value.startDate || undefined,
  classId: ruleForm.value.classId,
  studentId: ruleForm.value.studentId,
  courseId: ruleForm.value.courseId,
  teacherId: ruleForm.value.teacherId,
  teachingMode: ruleForm.value.teachingMode,
  requiresRoom: ruleForm.value.requiresRoom,
  roomId: ruleForm.value.roomId,
  startTime: ruleForm.value.startTime,
  endTime: ruleForm.value.endTime,
});

const handleSaveRule = async () => {
  try {
    const errors = await ruleFormRef.value?.validate?.();
    if (errors) return false;
    const payload = buildRulePayload();
    const conflictRes = await checkEduScheduleConflictsAPI(buildConflictPayload());
    if (conflictRes.data?.hasConflict) {
      Modal.warning({
        title: "保存前冲突校验",
        content: conflictRes.data.items?.length ? conflictRes.data.items.map((item) => item.reason).join("；") : "检测到排课冲突，请先处理后再保存。",
      });
      return false;
    }
    if (payload.id) {
      const previewRes = await previewEduScheduleRuleChangeAPI({ id: payload.id });
      const previewCount = previewRes.data?.list?.length || 0;
      const confirmText = previewCount > 0 ? `将影响 ${previewCount} 条未来课次，是否继续保存？` : "当前规则没有可替换的未来课次，是否继续保存？";
      await new Promise<void>((resolve, reject) => {
        Modal.confirm({
          title: "变更预览",
          content: confirmText,
          onOk: async () => {
            try {
              await editEduScheduleRuleAPI({ ...payload, id: payload.id! });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          onCancel: () => reject(new Error("cancel")),
        });
      });
    } else {
      await addEduScheduleRuleAPI(payload);
    }
    Message.success("排课规则保存成功");
    await fetchRuleList();
    resetRuleForm();
    return true;
  } catch {
    return false;
  }
};

const handleDeleteRule = async (id: string) => {
  await deleteEduScheduleRuleAPI({ id });
  Message.success("排课规则删除成功");
  fetchRuleList();
};

const termName = (id?: string | number) => termOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const className = (id?: string | number) => classOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const courseName = (id?: string | number) => courseOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const roomName = (id?: string | number) => roomOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const studentName = (id?: string | number) => studentOptions.value.find((item) => String(item.id) === String(id))?.name ?? "-";
const teacherLabel = (item: EduTeacherOptionItem) => item.name || item.nickName || item.username || "-";
const teacherName = (id?: string | number) => {
  const teacher = teacherOptions.value.find((item) => String(item.id) === String(id));
  return teacher ? teacherLabel(teacher) : "-";
};
const weekdaysText = (weekdays?: number[]) => {
  if (!weekdays || weekdays.length === 0) return "-";
  return weekdays
    .map((weekday) => weekdayOptions.find((item) => item.value === weekday)?.label)
    .filter((label): label is string => Boolean(label))
    .join("，");
};
const dateRangeText = (start?: string | null, end?: string | null) => [start || "-", end || "-"].join(" ~ ");
const timeRangeText = (start?: string, end?: string) => [start || "-", end || "-"].join(" ~ ");
const calendarCardDay = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
};
const targetText = (record: EduScheduleRuleItem) => {
  if (record.ruleType === "class") return className(record.classId);
  if (record.ruleType === "one_to_one") return studentName(record.studentId);
  return "-";
};

const buildCalendarParams = () => {
  const start = new Date();
  const end = new Date(start);
  if (calendarView.value === "day") {
    end.setDate(start.getDate());
  } else if (calendarView.value === "week") {
    end.setDate(start.getDate() + 6);
  } else {
    end.setDate(start.getDate() + 29);
  }
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    teacherId: calendarSearchForm.teacherId,
    classId: calendarSearchForm.classId,
    studentId: calendarSearchForm.studentId,
    roomId: calendarSearchForm.roomId,
  };
};

watch(calendarView, () => {
  handleCalendarSearch();
});

watch(activeTab, (newTab) => {
  if (newTab === "rules") fetchRuleList();
  else if (newTab === "lessons") fetchLessonList();
  else if (newTab === "calendar") fetchCalendarList();
});

const actionTypeLabelMap: Record<string, string> = {
  generate: "规则生成",
  regenerate: "规则重新生成",
  reschedule: "调课",
  stop: "停课",
  cancel: "取消",
  restore: "恢复",
  makeup: "补课",
};

const actionTypeLabel = (type?: string) => (type ? actionTypeLabelMap[type] || type : "-");

const lessonTypeText = (record: EduLessonItem) => {
  if (record.classId) return "班课";
  if (record.studentId) return "一对一";
  return "-";
};

const openLessonDrawer = async (record: EduLessonItem) => {
  selectedLesson.value = { ...record };
  lessonHistoryRows.value = [];
  lessonDrawerVisible.value = true;
  loadingHistory.value = true;
  try {
    const res = await getEduLessonChangeLogsAPI(record.id);
    lessonHistoryRows.value = res.data.list || [];
  } catch {
    lessonHistoryRows.value = [];
  } finally {
    loadingHistory.value = false;
  }
};

const handleLessonAction = async (action: "reschedule" | "stop" | "cancel" | "restore" | "makeup" | "history") => {
  const lessonId = selectedLesson.value.id;
  if (!lessonId) return;
  if (action === "history") {
    const res = await getEduLessonChangeLogsAPI(lessonId);
    lessonHistoryRows.value = res.data.list || [];
    Message.success("变更历史已加载");
    return;
  }
  if (action === "reschedule") {
    const payload: EduLessonRescheduleParams = {
      lessonId: String(selectedLesson.value.id),
      lessonDate: selectedLesson.value.lessonDate,
      startTime: selectedLesson.value.startTime,
      endTime: selectedLesson.value.endTime,
      teacherId: selectedLesson.value.teacherId || "",
      teachingMode: selectedLesson.value.teachingMode || "online",
      roomId: selectedLesson.value.roomId,
    };
    await rescheduleEduLessonAPI(payload);
  } else if (action === "stop") {
    const payload: EduLessonStatusActionParams = { lessonId: String(selectedLesson.value.id), reason: "课表日历操作停课" };
    await stopEduLessonAPI(payload);
    selectedLesson.value.status = "stopped";
  } else if (action === "cancel") {
    const payload: EduLessonStatusActionParams = { lessonId: String(selectedLesson.value.id), reason: "课表日历操作取消" };
    await cancelEduLessonAPI(payload);
    selectedLesson.value.status = "canceled";
  } else if (action === "restore") {
    const payload: EduLessonStatusActionParams = { lessonId: String(selectedLesson.value.id), reason: "课表日历操作恢复" };
    await restoreEduLessonAPI(payload);
    selectedLesson.value.status = "scheduled";
  } else if (action === "makeup") {
    const payload: EduLessonMakeupParams = {
      lessonId: String(selectedLesson.value.id),
      lessonDate: selectedLesson.value.lessonDate,
      startTime: selectedLesson.value.startTime,
      endTime: selectedLesson.value.endTime,
      teacherId: selectedLesson.value.teacherId || "",
      teachingMode: selectedLesson.value.teachingMode || "online",
      roomId: selectedLesson.value.roomId,
      reason: "课表日历发起补课",
    };
    await makeupEduLessonAPI(payload);
  }
  Message.success("操作已提交");
  await fetchCalendarList();
  await fetchLessonList();
  const res = await getEduLessonChangeLogsAPI(selectedLesson.value.id);
  lessonHistoryRows.value = res.data.list || [];
};

onMounted(async () => {
  await fetchOptions();
  await fetchRuleList();
  await fetchLessonList();
  await fetchCalendarList();
});
</script>

<style scoped>
.calendar-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.calendar-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-height: 152px;
  padding: 14px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: var(--color-bg-2);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.calendar-card:hover {
  border-color: rgb(var(--primary-6));
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.calendar-card__day {
  font-size: 12px;
  color: var(--color-text-3);
}

.calendar-card__date {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.calendar-card__time {
  font-size: 13px;
  color: rgb(var(--primary-6));
}

.calendar-card__meta {
  font-size: 13px;
  color: var(--color-text-2);
}

.calendar-footer {
  display: flex;
  justify-content: flex-end;
}

.lesson-history {
  margin-top: 20px;
}

.lesson-history__title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}

.lesson-history__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--color-text-1);
}

.lesson-history__reason {
  font-size: 12px;
  color: var(--color-text-3);
}
</style>
