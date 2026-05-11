<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="searchForm.name" placeholder="课程/项目名称" allow-clear />
            <a-input v-model="searchForm.code" placeholder="编码" allow-clear />
            <a-select v-model="searchForm.type" placeholder="类型" allow-clear style="width: 140px">
              <a-option v-for="item in courseTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
              <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
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
            <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:course:add']">
              <template #icon><icon-plus /></template>
              新增课程/项目
            </a-button>
            <a-button @click="importVisible = true" v-hasPerm="['edu:course:import']">导入</a-button>
            <a-button @click="handleExport" v-hasPerm="['edu:course:export']">导出</a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table
        row-key="id"
        :data="dataList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', minWidth: 1100 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="名称" data-index="name" :width="180" fixed="left" ellipsis tooltip />
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="类型" :width="120" align="center">
            <template #cell="{ record }">{{ labelOf(courseTypeOptions, record.type) }}</template>
          </a-table-column>
          <a-table-column title="适用年龄/年级" data-index="gradeRange" :width="160" />
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ labelOf(statusOptions, record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="90" align="center" />
          <a-table-column title="描述" data-index="description" :width="220" ellipsis tooltip />
          <a-table-column title="操作" :width="180" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)" v-hasPerm="['edu:course:edit']">编辑</a-link>
                <a-popconfirm content="确定删除该课程/项目吗？" @ok="handleDelete(record.id)">
                  <a-link status="danger" v-hasPerm="['edu:course:delete']">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="formModel.id ? '编辑课程/项目' : '新增课程/项目'"
      :width="layoutMode.width"
      :on-before-ok="handleSave"
      @cancel="resetForm"
      @close="resetForm"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="名称">
          <a-input v-model="formModel.name" placeholder="请输入课程/项目名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="编码">
          <a-input v-model="formModel.code" placeholder="请输入编码" allow-clear />
        </a-form-item>
        <a-form-item field="type" label="类型">
          <a-select v-model="formModel.type" placeholder="请选择类型" allow-clear>
            <a-option v-for="item in courseTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="gradeRange" label="适用年龄/年级">
          <a-input v-model="formModel.gradeRange" placeholder="例如：一年级-三年级" allow-clear />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formModel.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="sort" label="排序">
          <a-input-number v-model="formModel.sort" :min="0" />
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-textarea v-model="formModel.description" placeholder="请输入描述" />
        </a-form-item>
      </a-form>
    </a-modal>

    <import-dialog
      v-model:visible="importVisible"
      title="导入课程/项目"
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
  addEduCourseAPI,
  deleteEduCourseAPI,
  editEduCourseAPI,
  exportEduCourseAPI,
  getEduCourseListAPI,
  importEduCourseAPI,
  type EduCourseAddParams,
  type EduCourseItem,
  type EduCourseListParams,
} from "@/api/edu";
import ImportDialog from "../components/import-dialog.vue";
import { exportRowsToXlsx, type ExportColumn } from "../components/export-tools";
import { courseTypeOptions, labelOf, statusOptions } from "../components/options";

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({ width: isMobile.value ? "95%" : "640px", layout: isMobile.value ? "vertical" : "horizontal" }));

const loading = ref(false);
const dataList = ref<EduCourseItem[]>([]);
const searchForm = reactive<EduCourseListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const emptyForm = (): EduCourseAddParams & { id?: number } => ({
  name: "",
  code: "",
  type: "",
  gradeRange: "",
  status: 1,
  sort: 0,
  description: "",
});

const modalVisible = ref(false);
const formRef = ref();
const formModel = ref(emptyForm());
const rules: Record<string, any> = {
  name: [{ required: true, message: "请输入课程/项目名称" }],
  code: [{ required: true, message: "请输入编码" }],
};

const exportColumns: ExportColumn<Record<string, unknown>>[] = [
  { title: "名称", key: "name" },
  { title: "编码", key: "code" },
  { title: "类型", key: "type" },
  { title: "适用年龄/年级", key: "gradeRange" },
  { title: "状态", key: "status" },
  { title: "排序", key: "sort" },
  { title: "描述", key: "description" },
];

const importVisible = ref(false);
const importLoading = ref(false);
const importResult = ref();

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getEduCourseListAPI({ ...searchForm, pageNum: pagination.current, pageSize: pagination.pageSize });
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
  Object.assign(searchForm, { name: undefined, code: undefined, type: undefined, status: undefined });
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
  formModel.value = { ...emptyForm(), ...(record as EduCourseItem) };
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
      await editEduCourseAPI({ ...payload, id: payload.id });
      Message.success("课程/项目更新成功");
    } else {
      await addEduCourseAPI(payload);
      Message.success("课程/项目更新成功");
    }
    await fetchList();
    resetForm();
    return true;
  } catch {
    return false;
  }
};

const handleDelete = async (id: number) => {
  await deleteEduCourseAPI({ id });
  Message.success("课程/项目删除成功");
  fetchList();
};

const handleImport = async (rows: Record<string, unknown>[]) => {
  importLoading.value = true;
  try {
    const res = await importEduCourseAPI(rows);
    importResult.value = res.data;
    Message.success(`导入完成，成功 ${res.data.successCount} 行`);
    fetchList();
  } finally {
    importLoading.value = false;
  }
};

const handleExport = async () => {
  const res = await exportEduCourseAPI();
  exportRowsToXlsx(res.data.list as unknown as Record<string, unknown>[], exportColumns, "课程项目数据.xlsx", "课程项目");
};

const handleDownloadTemplate = () => {
  exportRowsToXlsx([], exportColumns, "课程项目导入模板.xlsx", "课程项目模板");
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
