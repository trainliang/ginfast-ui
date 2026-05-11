<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="searchForm.name" placeholder="班级名称" allow-clear />
            <a-input v-model="searchForm.code" placeholder="班级编码" allow-clear />
            <a-select v-model="searchForm.classType" placeholder="班级类型" allow-clear style="width: 140px">
              <a-option v-for="item in classTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.benefitCheckPolicy" placeholder="权益校验策略" allow-clear style="width: 140px">
              <a-option v-for="item in benefitCheckPolicyOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
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
            <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:class:add']">
              <template #icon><icon-plus /></template>
              新增班级
            </a-button>
            <a-button @click="importVisible = true" v-hasPerm="['edu:class:import']">导入</a-button>
            <a-button @click="handleExport" v-hasPerm="['edu:class:export']">导出</a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table
        row-key="id"
        :data="dataList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', minWidth: 1250 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="班级名称" data-index="name" :width="160" fixed="left" ellipsis tooltip />
          <a-table-column title="编码" data-index="code" :width="120" />
          <a-table-column title="类型" :width="100" align="center">
            <template #cell="{ record }">{{ labelOf(classTypeOptions, record.classType) }}</template>
          </a-table-column>
          <a-table-column title="课程/项目" :width="160" ellipsis tooltip>
            <template #cell="{ record }">{{ courseName(record.courseId) }}</template>
          </a-table-column>
          <a-table-column title="负责教师" :width="140" ellipsis tooltip>
            <template #cell="{ record }">{{ teacherName(record.teacherId) }}</template>
          </a-table-column>
          <a-table-column title="默认场地" :width="140" ellipsis tooltip>
            <template #cell="{ record }">{{ roomName(record.roomId) }}</template>
          </a-table-column>
          <a-table-column title="权益校验策略" :width="120" align="center">
            <template #cell="{ record }">{{ labelOf(benefitCheckPolicyOptions, record.benefitCheckPolicy) }}</template>
          </a-table-column>
          <a-table-column title="容量" data-index="capacity" :width="90" align="center" />
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ labelOf(statusOptions, record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="240" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="openMembers(record)" v-hasPerm="['edu:class:member']">成员</a-link>
                <a-link @click="handleEdit(record)" v-hasPerm="['edu:class:edit']">编辑</a-link>
                <a-popconfirm content="确定删除该班级吗？" @ok="handleDelete(record.id)">
                  <a-link status="danger" v-hasPerm="['edu:class:delete']">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="formModel.id ? '编辑班级' : '新增班级'"
      :width="layoutMode.width"
      :on-before-ok="handleSave"
      @cancel="resetForm"
      @close="resetForm"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="班级名称">
          <a-input v-model="formModel.name" placeholder="请输入班级名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="班级编码">
          <a-input v-model="formModel.code" placeholder="请输入班级编码" allow-clear />
        </a-form-item>
        <a-form-item field="classType" label="班级类型">
          <a-select v-model="formModel.classType" placeholder="请选择班级类型">
            <a-option v-for="item in classTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="courseId" label="课程/项目">
          <a-select v-model="formModel.courseId" placeholder="请选择课程/项目" allow-clear>
            <a-option v-for="item in courseOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="teacherId" label="负责教师">
          <a-select v-model="formModel.teacherId" placeholder="请选择教师" allow-clear>
            <a-option v-for="item in teacherOptions" :key="item.id" :value="item.id">
              {{ item.name || item.nickName || item.username }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="roomId" label="默认场地">
          <a-select v-model="formModel.roomId" placeholder="可选，不指定则不绑定默认场地" allow-clear>
            <a-option v-for="item in roomOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="benefitCheckPolicy" label="权益校验策略">
          <a-select v-model="formModel.benefitCheckPolicy" placeholder="请选择权益校验策略">
            <a-option v-for="item in benefitCheckPolicyOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="capacity" label="容量">
          <a-input-number v-model="formModel.capacity" :min="1" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formModel.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="formModel.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="memberDrawerVisible" :width="isMobile ? '100%' : 760" :footer="false">
      <template #title>班级成员 - {{ currentClass?.name }}</template>
      <a-space direction="vertical" fill size="medium">
        <a-space wrap>
          <a-select v-model="memberForm.studentId" placeholder="选择学生" allow-search allow-clear style="width: 180px">
            <a-option v-for="item in studentOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
          <a-select v-model="memberForm.status" placeholder="状态" style="width: 110px">
            <a-option v-for="item in memberStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
          <a-date-picker v-model="memberForm.joinDate" placeholder="入班日期" value-format="YYYY-MM-DD" style="width: 130px" />
          <a-date-picker v-model="memberForm.leaveDate" placeholder="离班日期" value-format="YYYY-MM-DD" style="width: 130px" />
          <a-input v-model="memberForm.remark" placeholder="备注" allow-clear style="width: 140px" />
          <a-button type="primary" @click="handleSaveMember" v-hasPerm="['edu:class:member']">
            {{ memberForm.id ? "保存成员" : "添加成员" }}
          </a-button>
          <a-button @click="resetMemberForm">清空</a-button>
        </a-space>
        <a-table row-key="id" :data="memberList" :loading="memberLoading" :pagination="false" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column title="学生" :width="160">
              <template #cell="{ record }">{{ studentName(record.studentId) }}</template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">{{ labelOf(memberStatusOptions, record.status) }}</template>
            </a-table-column>
            <a-table-column title="入班日期" data-index="joinDate" :width="140" />
            <a-table-column title="备注" data-index="remark" ellipsis tooltip />
            <a-table-column title="操作" :width="140" align="center">
              <template #cell="{ record }">
                <a-space>
                  <a-link @click="editMember(record)">编辑</a-link>
                  <a-popconfirm content="确定移除该成员吗？" @ok="deleteMember(record.id)">
                    <a-link status="danger">移除</a-link>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-space>
    </a-drawer>

    <import-dialog
      v-model:visible="importVisible"
      title="导入班级"
      :template-columns="exportColumns"
      :loading="importLoading"
      :result="importResult"
      @submit="handleImport"
      @download-template="handleDownloadTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import type { TableData } from "@arco-design/web-vue/es/table/interface";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import {
  addEduClassAPI,
  addEduClassMemberAPI,
  deleteEduClassAPI,
  deleteEduClassMemberAPI,
  editEduClassAPI,
  editEduClassMemberAPI,
  exportEduClassAPI,
  getEduClassListAPI,
  getEduClassMemberListAPI,
  getEduClassTeacherOptionsAPI,
  getEduCourseOptionsAPI,
  getEduRoomOptionsAPI,
  getEduStudentListAPI,
  importEduClassAPI,
  type EduClassAddParams,
  type EduClassItem,
  type EduClassListParams,
  type EduClassMemberAddParams,
  type EduClassMemberItem,
  type EduCourseOptionItem,
  type EduRoomOptionItem,
  type EduStudentItem,
  type EduTeacherOptionItem,
} from "@/api/edu";
import ImportDialog from "../components/import-dialog.vue";
import { exportRowsToXlsx, type ExportColumn } from "../components/export-tools";
import { benefitCheckPolicyOptions, classTypeOptions, labelOf, memberStatusOptions, statusOptions } from "../components/options";

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({ width: isMobile.value ? "95%" : "720px", layout: isMobile.value ? "vertical" : "horizontal" }));

const loading = ref(false);
const dataList = ref<EduClassItem[]>([]);
const searchForm = reactive<EduClassListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const courseOptions = ref<EduCourseOptionItem[]>([]);
const roomOptions = ref<EduRoomOptionItem[]>([]);
const teacherOptions = ref<EduTeacherOptionItem[]>([]);
const studentOptions = ref<EduStudentItem[]>([]);

const emptyForm = (): EduClassAddParams & { id?: number } => ({
  name: "",
  code: "",
  classType: "daycare",
  courseId: undefined as unknown as number,
  teacherId: undefined as unknown as number,
  roomId: undefined,
  capacity: 20,
  benefitCheckPolicy: "required",
  status: 1,
  remark: "",
});

const modalVisible = ref(false);
const formRef = ref();
const formModel = ref(emptyForm());
const rules: Record<string, any> = {
  name: [{ required: true, message: "请输入班级名称" }],
  code: [{ required: true, message: "请输入班级编码" }],
  classType: [{ required: true, message: "请选择班级类型" }],
  courseId: [{ required: true, message: "请选择课程/项目" }],
  teacherId: [{ required: true, message: "请选择教师" }],
  capacity: [{ required: true, message: "请输入容量" }],
};

const exportColumns: ExportColumn<Record<string, unknown>>[] = [
  { title: "班级名称", key: "name" },
  { title: "班级编码", key: "code" },
  { title: "班级类型", key: "classType" },
  { title: "课程ID", key: "courseId" },
  { title: "教师ID", key: "teacherId" },
  { title: "场地ID", key: "roomId" },
  { title: "权益校验策略", key: "benefitCheckPolicy" },
  { title: "容量", key: "capacity" },
  { title: "状态", key: "status" },
  { title: "备注", key: "remark" },
];

const importVisible = ref(false);
const importLoading = ref(false);
const importResult = ref();

const memberDrawerVisible = ref(false);
const memberLoading = ref(false);
const memberList = ref<EduClassMemberItem[]>([]);
const currentClass = ref<EduClassItem | null>(null);
const memberForm = ref<EduClassMemberAddParams & { id?: number }>({
  classId: 0,
  studentId: undefined as unknown as number,
  joinDate: "",
  leaveDate: "",
  status: "studying",
  remark: "",
});

const courseName = (id?: number) => courseOptions.value.find((item) => item.id === id)?.name ?? "-";
const roomName = (id?: number) => roomOptions.value.find((item) => item.id === id)?.name ?? "-";
const teacherName = (id?: number) => {
  const item = teacherOptions.value.find((option) => option.id === id);
  return item?.name || item?.nickName || item?.username || "-";
};
const studentName = (id?: number) => studentOptions.value.find((item) => item.id === id)?.name ?? "-";

const fetchOptions = async () => {
  const [courses, rooms, teachers, students] = await Promise.all([
    getEduCourseOptionsAPI(),
    getEduRoomOptionsAPI(),
    getEduClassTeacherOptionsAPI(),
    getEduStudentListAPI({ pageNum: 1, pageSize: 500 }),
  ]);
  courseOptions.value = courses.data.list;
  roomOptions.value = rooms.data.list;
  teacherOptions.value = teachers.data.list;
  studentOptions.value = students.data.list;
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getEduClassListAPI({ ...searchForm, pageNum: pagination.current, pageSize: pagination.pageSize });
    dataList.value = res.data.list;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};

const handleReset = () => {
  Object.assign(searchForm, { name: undefined, code: undefined, classType: undefined, benefitCheckPolicy: undefined });
  handleSearch();
};

const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchList();
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.current = 1;
  fetchList();
};

const handleCreate = () => {
  formModel.value = emptyForm();
  modalVisible.value = true;
};

const handleEdit = (record: TableData) => {
  formModel.value = { ...emptyForm(), ...(record as EduClassItem) };
  modalVisible.value = true;
};

const resetForm = () => {
  formRef.value?.resetFields?.();
  formModel.value = emptyForm();
};

const handleSave = async () => {
  try {
    const errors = await formRef.value?.validate?.();
    if (errors) return false;
    const payload = formModel.value;
    if (payload.id) {
      await editEduClassAPI({ ...payload, id: payload.id });
      Message.success("班级更新成功");
    } else {
      await addEduClassAPI(payload);
      Message.success("班级创建成功");
    }
    await fetchList();
    resetForm();
    return true;
  } catch {
    return false;
  }
};

const handleDelete = async (id: number) => {
  await deleteEduClassAPI({ id });
  Message.success("班级删除成功");
  fetchList();
};

const openMembers = async (record: EduClassItem) => {
  currentClass.value = record;
  memberDrawerVisible.value = true;
  resetMemberForm();
  await fetchMembers();
};

const fetchMembers = async () => {
  if (!currentClass.value) return;
  memberLoading.value = true;
  try {
    const res = await getEduClassMemberListAPI(currentClass.value.id, { pageNum: 1, pageSize: 500 });
    memberList.value = res.data.list;
  } finally {
    memberLoading.value = false;
  }
};

const resetMemberForm = () => {
  memberForm.value = {
    classId: currentClass.value?.id ?? 0,
    studentId: undefined as unknown as number,
    joinDate: "",
    leaveDate: "",
    status: "studying",
    remark: "",
  };
};

const handleSaveMember = async () => {
  if (!currentClass.value || !memberForm.value.studentId) {
    Message.warning("请选择学生");
    return;
  }
  if (memberForm.value.id) {
    await editEduClassMemberAPI(currentClass.value.id, { ...memberForm.value, id: memberForm.value.id });
    Message.success("成员更新成功");
  } else {
    await addEduClassMemberAPI(currentClass.value.id, memberForm.value);
    Message.success("成员添加成功");
  }
  resetMemberForm();
  fetchMembers();
};

const editMember = (record: EduClassMemberItem) => {
  memberForm.value = { ...record };
};

const deleteMember = async (id: number) => {
  if (!currentClass.value) return;
  await deleteEduClassMemberAPI(currentClass.value.id, { id });
  Message.success("成员已移除");
  fetchMembers();
};

const handleImport = async (rows: Record<string, unknown>[]) => {
  importLoading.value = true;
  try {
    const res = await importEduClassAPI(rows);
    importResult.value = res.data;
    Message.success(`导入完成，成功 ${res.data.successCount} 行`);
    fetchList();
  } finally {
    importLoading.value = false;
  }
};

const handleExport = async () => {
  const res = await exportEduClassAPI();
  exportRowsToXlsx(res.data.list as unknown as Record<string, unknown>[], exportColumns, "班级数据.xlsx", "班级");
};

const handleDownloadTemplate = () => {
  exportRowsToXlsx([], exportColumns, "班级导入模板.xlsx", "班级模板");
};

onMounted(async () => {
  await fetchOptions();
  await fetchList();
});
</script>

<style scoped lang="scss">
.edu-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
