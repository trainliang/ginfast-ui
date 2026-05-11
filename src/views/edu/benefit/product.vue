<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="searchForm.name" placeholder="权益产品名称" allow-clear />
            <a-input v-model="searchForm.code" placeholder="编码" allow-clear />
            <a-select v-model="searchForm.benefitType" placeholder="权益类型" allow-clear style="width: 130px">
              <a-option v-for="item in benefitTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.calculationMode" placeholder="核算方式" allow-clear style="width: 150px">
              <a-option v-for="item in calculationModeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
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
          <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:benefitProduct:add']">
            <template #icon><icon-plus /></template>
            新增权益产品
          </a-button>
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
          <a-table-column title="编码" data-index="code" :width="130" />
          <a-table-column title="权益类型" :width="120" align="center">
            <template #cell="{ record }">{{ labelOf(benefitTypeOptions, record.benefitType) }}</template>
          </a-table-column>
          <a-table-column title="核算方式" :width="140" align="center">
            <template #cell="{ record }">{{ labelOf(calculationModeOptions, record.calculationMode) }}</template>
          </a-table-column>
          <a-table-column title="总次数" data-index="totalCount" :width="90" align="center" />
          <a-table-column title="有效天数" data-index="validDays" :width="100" align="center" />
          <a-table-column title="课程适用范围" :width="200" ellipsis tooltip>
            <template #cell="{ record }">{{ courseScopeText(record.courseScope) }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ labelOf(benefitStatusOptions, record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="170" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)" v-hasPerm="['edu:benefitProduct:edit']">编辑</a-link>
                <a-popconfirm content="确定删除该权益产品吗？" @ok="handleDelete(record.id)">
                  <a-link status="danger" v-hasPerm="['edu:benefitProduct:delete']">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="formModel.id ? '编辑权益产品' : '新增权益产品'"
      :width="layoutMode.width"
      :on-before-ok="handleSave"
      @cancel="resetForm"
      @close="resetForm"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="产品名称">
          <a-input v-model="formModel.name" placeholder="请输入权益产品名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="产品编码">
          <a-input v-model="formModel.code" placeholder="请输入编码" allow-clear />
        </a-form-item>
        <a-form-item field="benefitType" label="权益类型">
          <a-select v-model="formModel.benefitType" placeholder="请选择权益类型">
            <a-option v-for="item in benefitTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="calculationMode" label="核算方式">
          <a-select v-model="formModel.calculationMode" placeholder="请选择核算方式">
            <a-option v-for="item in calculationModeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="courseScope" label="课程适用范围">
          <a-select v-model="formModel.courseScope" multiple allow-clear allow-search placeholder="不选择表示适用范围由学生权益决定">
            <a-option v-for="item in courseOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="totalCount" label="总次数">
          <a-input-number v-model="formModel.totalCount" :min="0" :disabled="formModel.calculationMode !== 'count_limited'" />
        </a-form-item>
        <a-form-item field="validDays" label="有效天数">
          <a-input-number v-model="formModel.validDays" :min="0" />
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
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import type { TableData } from "@arco-design/web-vue/es/table/interface";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import {
  addEduBenefitProductAPI,
  deleteEduBenefitProductAPI,
  editEduBenefitProductAPI,
  getEduBenefitProductListAPI,
  getEduCourseOptionsAPI,
  type EduBenefitProductAddParams,
  type EduBenefitProductItem,
  type EduBenefitProductListParams,
  type EduCourseOptionItem,
} from "@/api/edu";
import { benefitStatusOptions, benefitTypeOptions, calculationModeOptions, labelOf } from "../components/options";

type ProductForm = EduBenefitProductAddParams & { id?: number; courseScope?: number[] };

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({
  width: isMobile.value ? "95%" : "720px",
  layout: isMobile.value ? "vertical" : "horizontal",
}));

const loading = ref(false);
const dataList = ref<EduBenefitProductItem[]>([]);
const courseOptions = ref<EduCourseOptionItem[]>([]);
const searchForm = reactive<EduBenefitProductListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const emptyForm = (): ProductForm => ({
  name: "",
  code: "",
  benefitType: "course",
  calculationMode: "count_limited",
  totalCount: 0,
  validDays: 0,
  status: 1,
  remark: "",
  courseScope: [],
});

const modalVisible = ref(false);
const formRef = ref();
const formModel = ref<ProductForm>(emptyForm());
const rules: Record<string, any> = {
  name: [{ required: true, message: "请输入权益产品名称" }],
  code: [{ required: true, message: "请输入权益产品编码" }],
  benefitType: [{ required: true, message: "请选择权益类型" }],
  calculationMode: [{ required: true, message: "请选择核算方式" }],
};

const fetchOptions = async () => {
  const res = await getEduCourseOptionsAPI();
  courseOptions.value = res.data.list;
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getEduBenefitProductListAPI({
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
  Object.assign(searchForm, { name: undefined, code: undefined, benefitType: undefined, calculationMode: undefined });
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
  formModel.value = { ...emptyForm(), ...(record as EduBenefitProductItem) };
  modalVisible.value = true;
};

const resetForm = () => {
  formRef.value?.resetFields?.();
  formModel.value = emptyForm();
};

const buildPayload = () => {
  const { courseScope: _courseScope, ...payload } = formModel.value;
  if (payload.calculationMode !== "count_limited") {
    payload.totalCount = 0;
  }
  return payload;
};

const handleSave = async () => {
  try {
    const errors = await formRef.value?.validate?.();
    if (errors) return false;
    const payload = buildPayload();
    if (payload.id) {
      await editEduBenefitProductAPI({ ...payload, id: payload.id });
    } else {
      await addEduBenefitProductAPI(payload);
    }
    Message.success("权益产品保存成功");
    await fetchList();
    resetForm();
    return true;
  } catch {
    return false;
  }
};

const handleDelete = async (id: number) => {
  await deleteEduBenefitProductAPI({ id });
  Message.success("权益产品删除成功");
  fetchList();
};

const courseScopeText = (scope?: number[]) => {
  if (!scope?.length) return "未设置";
  const names = scope.map((id) => courseOptions.value.find((item) => item.id === id)?.name || id).join("、");
  return names || `已选 ${scope.length} 个课程`;
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
