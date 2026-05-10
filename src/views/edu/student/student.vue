<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="searchForm.name" placeholder="学生姓名" allow-clear />
            <a-input v-model="searchForm.phone" placeholder="联系电话" allow-clear />
            <a-select v-model="searchForm.status" placeholder="学生状态" allow-clear style="width: 140px">
              <a-option v-for="item in studentStatusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-option>
            </a-select>
            <a-input v-model="searchForm.school" placeholder="学校" allow-clear />
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
            <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:student:add']">
              <template #icon><icon-plus /></template>
              新增学生
            </a-button>
            <a-button @click="importVisible = true" v-hasPerm="['edu:student:import']">导入</a-button>
            <a-button @click="handleExport" v-hasPerm="['edu:student:export']">导出</a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table
        row-key="id"
        :data="dataList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', minWidth: 1300 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="姓名" data-index="name" :width="120" fixed="left" />
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : record.status === 0 ? 'orange' : 'red'">
                {{ labelOf(studentStatusOptions, record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="性别" :width="90" align="center">
            <template #cell="{ record }">{{ labelOf(genderOptions, record.gender) }}</template>
          </a-table-column>
          <a-table-column title="联系电话" data-index="phone" :width="130" />
          <a-table-column title="学校" data-index="school" :width="160" ellipsis tooltip />
          <a-table-column title="年级" data-index="grade" :width="100" />
          <a-table-column title="来源" data-index="sourceChannel" :width="120" />
          <a-table-column title="紧急联系人" data-index="emergencyContact" :width="140" />
          <a-table-column title="接送备注" data-index="pickupNote" :width="180" ellipsis tooltip />
          <a-table-column title="操作" :width="180" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)" v-hasPerm="['edu:student:edit']">编辑</a-link>
                <a-popconfirm content="确定删除该学生吗？" @ok="handleDelete(record.id)">
                  <a-link status="danger" v-hasPerm="['edu:student:delete']">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="formModel.id ? '编辑学生' : '新增学生'"
      :width="layoutMode.width"
      :on-before-ok="handleSave"
      @cancel="resetForm"
      @close="resetForm"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="学生姓名">
          <a-input v-model="formModel.name" placeholder="请输入学生姓名" allow-clear />
        </a-form-item>
        <a-form-item field="phone" label="联系电话">
          <a-input v-model="formModel.phone" placeholder="请输入联系电话" allow-clear />
        </a-form-item>
        <a-form-item field="gender" label="性别">
          <a-select v-model="formModel.gender" placeholder="请选择性别" allow-clear>
            <a-option v-for="item in genderOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-select v-model="formModel.status" placeholder="请选择状态">
            <a-option v-for="item in studentStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="school" label="学校">
          <a-input v-model="formModel.school" placeholder="请输入学校" allow-clear />
        </a-form-item>
        <a-form-item field="grade" label="年级">
          <a-input v-model="formModel.grade" placeholder="请输入年级" allow-clear />
        </a-form-item>
        <a-form-item field="sourceChannel" label="来源渠道">
          <a-input v-model="formModel.sourceChannel" placeholder="请输入来源渠道" allow-clear />
        </a-form-item>
        <a-form-item field="emergencyContact" label="紧急联系人">
          <a-input v-model="formModel.emergencyContact" placeholder="请输入紧急联系人" allow-clear />
        </a-form-item>
        <a-form-item field="pickupNote" label="接送备注">
          <a-textarea v-model="formModel.pickupNote" placeholder="请输入接送备注" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model="formModel.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-modal>

    <import-dialog
      v-model:visible="importVisible"
      title="导入学生"
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
  addEduStudentAPI,
  deleteEduStudentAPI,
  editEduStudentAPI,
  exportEduStudentAPI,
  getEduStudentListAPI,
  importEduStudentAPI,
  type EduStudentAddParams,
  type EduStudentItem,
  type EduStudentListParams,
} from "@/api/edu";
import ImportDialog from "../components/import-dialog.vue";
import { exportRowsToXlsx, type ExportColumn } from "../components/export-tools";
import { genderOptions, labelOf, studentStatusOptions } from "../components/options";

const { isMobile } = useDevicesSize();

const layoutMode = computed(() => ({
  width: isMobile.value ? "95%" : "720px",
  layout: isMobile.value ? "vertical" : "horizontal",
}));

const loading = ref(false);
const dataList = ref<EduStudentItem[]>([]);
const searchForm = reactive<EduStudentListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const emptyForm = (): EduStudentAddParams & { id?: number } => ({
  name: "",
  phone: "",
  gender: "unknown",
  status: 1,
  school: "",
  grade: "",
  sourceChannel: "",
  emergencyContact: "",
  pickupNote: "",
  remark: "",
  contacts: [],
});

const modalVisible = ref(false);
const formRef = ref();
const formModel = ref(emptyForm());
const rules: Record<string, any> = {
  name: [{ required: true, message: "请输入学生姓名" }],
};

const exportColumns: ExportColumn<Record<string, unknown>>[] = [
  { title: "学生姓名", key: "name" },
  { title: "联系电话", key: "phone" },
  { title: "性别", key: "gender" },
  { title: "状态", key: "status" },
  { title: "学校", key: "school" },
  { title: "年级", key: "grade" },
  { title: "来源渠道", key: "sourceChannel" },
  { title: "紧急联系人", key: "emergencyContact" },
  { title: "接送备注", key: "pickupNote" },
  { title: "备注", key: "remark" },
];

const importVisible = ref(false);
const importLoading = ref(false);
const importResult = ref();

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getEduStudentListAPI({
      ...searchForm,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    });
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
  Object.assign(searchForm, { name: undefined, phone: undefined, status: undefined, school: undefined });
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
  formModel.value = { ...emptyForm(), ...(record as EduStudentItem) };
  modalVisible.value = true;
};

const resetForm = () => {
  formRef.value?.resetFields?.();
  formModel.value = emptyForm();
};

const handleSave = async () => {
  const errors = await formRef.value?.validate?.();
  if (errors) {
    return false;
  }
  const payload = formModel.value;
  if (payload.id) {
    await editEduStudentAPI({ ...payload, id: payload.id });
    Message.success("学生更新成功");
  } else {
    await addEduStudentAPI(payload);
    Message.success("学生创建成功");
  }
  await fetchList();
  resetForm();
  return true;
};

const handleDelete = async (id: number) => {
  await deleteEduStudentAPI({ id });
  Message.success("学生删除成功");
  fetchList();
};

const handleImport = async (rows: Record<string, unknown>[]) => {
  importLoading.value = true;
  try {
    const res = await importEduStudentAPI(rows);
    importResult.value = res.data;
    Message.success(`导入完成，成功 ${res.data.successCount} 行`);
    fetchList();
  } finally {
    importLoading.value = false;
  }
};

const handleExport = async () => {
  const res = await exportEduStudentAPI();
  exportRowsToXlsx(res.data.list as unknown as Record<string, unknown>[], exportColumns, "学生数据.xlsx", "学生");
};

const handleDownloadTemplate = () => {
  exportRowsToXlsx([], exportColumns, "学生导入模板.xlsx", "学生模板");
};

onMounted(fetchList);
</script>

<style scoped lang="scss">
.edu-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
