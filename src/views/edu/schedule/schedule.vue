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
              <a-table-column title="星期" :width="100" align="center">
                <template #cell="{ record }">{{ weekdayText(record.weekday) }}</template>
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
        <a-form-item v-if="ruleForm.repeatType === 'weekly'" field="weekday" label="星期">
          <a-select v-model="ruleForm.weekday" placeholder="请选择星期" allow-clear>
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
  </div>
</template>

<script setup lang="ts">
import { Modal, Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import type { TableData } from "@arco-design/web-vue/es/table/interface";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import {
  addEduScheduleRuleAPI,
  checkEduScheduleConflictsAPI,
  deleteEduScheduleRuleAPI,
  editEduScheduleRuleAPI,
  getEduLessonListAPI,
  getEduScheduleRuleListAPI,
  previewEduScheduleRuleChangeAPI,
  type EduCourseOptionItem,
  type EduLessonItem,
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
const lessonSearchForm = reactive<{ status?: string; classId?: number; studentId?: number; teacherId?: number }>({});
const lessonPagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const ruleModalVisible = ref(false);
const ruleFormRef = ref();
const emptyRuleForm = (): EduScheduleRuleAddParams & { id?: number } => ({
  name: "",
  ruleType: "class",
  repeatType: "weekly",
  termId: undefined,
  startDate: "",
  endDate: "",
  weekday: 1,
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
  startTime: [{ required: true, message: "请选择开始时间" }],
  endTime: [{ required: true, message: "请选择结束时间" }],
};

const termOptions = ref<EduTermItem[]>([]);
const classOptions = ref<EduClassItem[]>([]);
const courseOptions = ref<EduCourseOptionItem[]>([]);
const teacherOptions = ref<EduTeacherOptionItem[]>([]);
const roomOptions = ref<EduRoomOptionItem[]>([]);
const studentOptions = ref<EduStudentItem[]>([]);

const showClassField = computed(() => ruleForm.value.ruleType === "class");
const showStudentField = computed(() => ruleForm.value.ruleType === "one_to_one");

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

const handleRuleSearch = () => { rulePagination.current = 1; fetchRuleList(); };
const handleRuleReset = () => { Object.assign(ruleSearchForm, { name: undefined, ruleType: undefined, repeatType: undefined, status: undefined }); handleRuleSearch(); };
const handleRulePageChange = (page: number) => { rulePagination.current = page; fetchRuleList(); };
const handleRulePageSizeChange = (pageSize: number) => { rulePagination.pageSize = pageSize; rulePagination.current = 1; fetchRuleList(); };
const handleLessonSearch = () => { lessonPagination.current = 1; fetchLessonList(); };
const handleLessonReset = () => { Object.assign(lessonSearchForm, { status: undefined, classId: undefined, studentId: undefined, teacherId: undefined }); handleLessonSearch(); };
const handleLessonPageChange = (page: number) => { lessonPagination.current = page; fetchLessonList(); };
const handleLessonPageSizeChange = (pageSize: number) => { lessonPagination.pageSize = pageSize; lessonPagination.current = 1; fetchLessonList(); };

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
    payload.weekday = 0;
  }
  if (payload.requiresRoom === 0) {
    payload.roomId = undefined;
  }
  return payload;
};

const buildConflictPayload = () => ({
  lessonId: 0,
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
      const previewRes = await previewEduScheduleRuleChangeAPI({ id: Number(payload.id) });
      const previewCount = previewRes.data?.list?.length || 0;
      const confirmText = previewCount > 0 ? `将影响 ${previewCount} 条未来课次，是否继续保存？` : "当前规则没有可替换的未来课次，是否继续保存？";
      await new Promise<void>((resolve, reject) => {
        Modal.confirm({
          title: "变更预览",
          content: confirmText,
          onOk: async () => {
            await editEduScheduleRuleAPI({ ...payload, id: Number(payload.id) });
            resolve();
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

const handleDeleteRule = async (id: number) => {
  await deleteEduScheduleRuleAPI({ id });
  Message.success("排课规则删除成功");
  fetchRuleList();
};

const termName = (id?: number) => termOptions.value.find((item) => item.id === id)?.name ?? "-";
const className = (id?: number) => classOptions.value.find((item) => item.id === id)?.name ?? "-";
const courseName = (id?: number) => courseOptions.value.find((item) => item.id === id)?.name ?? "-";
const roomName = (id?: number) => roomOptions.value.find((item) => item.id === id)?.name ?? "-";
const studentName = (id?: number) => studentOptions.value.find((item) => item.id === id)?.name ?? "-";
const teacherLabel = (item: EduTeacherOptionItem) => item.name || item.nickName || item.username || "-";
const teacherName = (id?: number) => {
  const teacher = teacherOptions.value.find((item) => item.id === id);
  return teacher ? teacherLabel(teacher) : "-";
};
const weekdayText = (weekday?: number) => weekdayOptions.find((item) => item.value === weekday)?.label ?? "-";
const dateRangeText = (start?: string | null, end?: string | null) => [start || "-", end || "-"].join(" ~ ");
const timeRangeText = (start?: string, end?: string) => [start || "-", end || "-"].join(" ~ ");
const targetText = (record: EduScheduleRuleItem) => {
  if (record.ruleType === "class") return className(record.classId);
  if (record.ruleType === "one_to_one") return studentName(record.studentId);
  return "-";
};

onMounted(async () => {
  await fetchOptions();
  await fetchRuleList();
  await fetchLessonList();
});
</script>
