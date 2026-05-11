<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input-number v-model="searchForm.studentId" placeholder="学生ID" :min="1" allow-clear style="width: 130px" />
            <a-input-number v-model="searchForm.courseId" placeholder="课程ID" :min="1" allow-clear style="width: 130px" />
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
              <a-option v-for="item in benefitStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
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
            <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:studentBenefit:add']">
              <template #icon><icon-plus /></template>
              新增学生权益
            </a-button>
            <a-button @click="openCheckDrawer" v-hasPerm="['edu:studentBenefit:check']">权益校验</a-button>
            <a-button @click="handleRepair" v-hasPerm="['edu:studentBenefit:repair']">续费修复</a-button>
            <a-button @click="openExternalSyncDrawer" v-hasPerm="['edu:benefitExternalSync:list']">外部同步</a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table
        row-key="id"
        :data="dataList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', minWidth: 1200 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="学生ID" data-index="studentId" :width="100" fixed="left" />
          <a-table-column title="产品ID" data-index="productId" :width="100" />
          <a-table-column title="权益类型" :width="110">
            <template #cell="{ record }">{{ labelOf(benefitTypeOptions, record.benefitType) }}</template>
          </a-table-column>
          <a-table-column title="核算方式" :width="130">
            <template #cell="{ record }">{{ labelOf(calculationModeOptions, record.calculationMode) }}</template>
          </a-table-column>
          <a-table-column title="课程ID" data-index="courseId" :width="100" />
          <a-table-column title="剩余次数" data-index="remainingCount" :width="100" align="center" />
          <a-table-column title="有效期" :width="220">
            <template #cell="{ record }">{{ record.validFrom || "-" }} 至 {{ record.validTo || "-" }}</template>
          </a-table-column>
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ labelOf(benefitStatusOptions, record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="110" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
              <a-link @click="handleEdit(record)" v-hasPerm="['edu:studentBenefit:edit']">编辑</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="formModel.id ? '编辑学生权益' : '新增学生权益'"
      :width="layoutMode.width"
      :on-before-ok="handleSave"
      @cancel="resetForm"
      @close="resetForm"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="studentId" label="学生ID">
          <a-input-number v-model="formModel.studentId" :min="1" placeholder="请输入学生ID" />
        </a-form-item>
        <a-form-item field="productId" label="产品ID">
          <a-input-number v-model="formModel.productId" :min="0" placeholder="可选" />
        </a-form-item>
        <a-form-item field="courseId" label="课程ID">
          <a-input-number v-model="formModel.courseId" :min="1" placeholder="请输入课程ID" />
        </a-form-item>
        <a-form-item field="classId" label="班级ID">
          <a-input-number v-model="formModel.classId" :min="0" placeholder="0 表示不限班级" />
        </a-form-item>
        <a-form-item field="teacherId" label="教师ID">
          <a-input-number v-model="formModel.teacherId" :min="0" placeholder="0 表示不限教师" />
        </a-form-item>
        <a-form-item field="benefitType" label="权益类型">
          <a-select v-model="formModel.benefitType">
            <a-option v-for="item in benefitTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="calculationMode" label="核算方式">
          <a-select v-model="formModel.calculationMode">
            <a-option v-for="item in calculationModeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="totalCount" label="总次数">
          <a-input-number v-model="formModel.totalCount" :min="0" />
        </a-form-item>
        <a-form-item field="usedCount" label="已用次数">
          <a-input-number v-model="formModel.usedCount" :min="0" />
        </a-form-item>
        <a-form-item field="remainingCount" label="剩余次数">
          <a-input-number v-model="formModel.remainingCount" :min="0" />
        </a-form-item>
        <a-form-item field="validFrom" label="开始日期">
          <a-date-picker v-model="formModel.validFrom" value-format="YYYY-MM-DD" style="width: 100%" />
        </a-form-item>
        <a-form-item field="validTo" label="结束日期">
          <a-date-picker v-model="formModel.validTo" value-format="YYYY-MM-DD" style="width: 100%" />
        </a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formModel.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item field="sourceType" label="来源">
          <a-input v-model="formModel.sourceType" placeholder="manual/external" allow-clear />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="checkVisible" :width="isMobile ? '100%' : 560" :footer="false">
      <template #title>权益校验</template>
      <a-form :model="checkForm" layout="vertical">
        <a-form-item field="studentId" label="学生ID">
          <a-input-number v-model="checkForm.studentId" :min="1" />
        </a-form-item>
        <a-form-item field="courseId" label="课程ID">
          <a-input-number v-model="checkForm.courseId" :min="1" />
        </a-form-item>
        <a-form-item field="classId" label="班级ID">
          <a-input-number v-model="checkForm.classId" :min="0" />
        </a-form-item>
        <a-form-item field="teacherId" label="教师ID">
          <a-input-number v-model="checkForm.teacherId" :min="0" />
        </a-form-item>
        <a-button type="primary" :loading="checking" @click="handleCheck">执行校验</a-button>
      </a-form>
      <a-descriptions v-if="checkResult" :data="checkResultRows" bordered style="margin-top: 16px" />
    </a-drawer>

    <a-drawer v-model:visible="externalSyncVisible" :width="isMobile ? '100%' : 900" :footer="false">
      <template #title>外部同步状态</template>
      <a-table row-key="id" :data="externalSyncList" :loading="externalSyncLoading" :pagination="false" :bordered="{ cell: true }">
        <template #columns>
          <a-table-column title="任务ID" data-index="id" :width="90" />
          <a-table-column title="学生ID" data-index="studentId" :width="100" />
          <a-table-column title="供应商" data-index="providerCode" :width="130" />
          <a-table-column title="幂等键" data-index="idempotencyKey" :width="180" ellipsis tooltip />
          <a-table-column title="状态" :width="120">
            <template #cell="{ record }">{{ labelOf(externalSyncStatusOptions, record.status) }}</template>
          </a-table-column>
          <a-table-column title="重试次数" data-index="retryCount" :width="100" align="center" />
          <a-table-column title="操作" :width="100" align="center">
            <template #cell="{ record }">
              <a-link @click="retrySync(record.id)" v-hasPerm="['edu:benefitExternalSync:retry']">重试</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import type { TableData } from "@arco-design/web-vue/es/table/interface";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import {
  addEduStudentBenefitAPI,
  checkEduStudentBenefitAPI,
  editEduStudentBenefitAPI,
  getEduBenefitExternalSyncListAPI,
  getEduStudentBenefitListAPI,
  repairEduStudentBenefitScheduleAPI,
  retryEduBenefitExternalSyncAPI,
  type EduBenefitExternalSyncItem,
  type EduStudentBenefitAddParams,
  type EduStudentBenefitItem,
  type EduStudentBenefitListParams,
} from "@/api/edu";
import {
  benefitStatusOptions,
  benefitTypeOptions,
  calculationModeOptions,
  externalSyncStatusOptions,
  labelOf,
} from "../components/options";

type StudentBenefitForm = EduStudentBenefitAddParams & { id?: number };
type CheckResult = Record<string, unknown>;

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({
  width: isMobile.value ? "95%" : "760px",
  layout: isMobile.value ? "vertical" : "horizontal",
}));

const loading = ref(false);
const dataList = ref<EduStudentBenefitItem[]>([]);
const searchForm = reactive<EduStudentBenefitListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const emptyForm = (): StudentBenefitForm => ({
  studentId: undefined as unknown as number,
  productId: 0,
  benefitType: "course",
  calculationMode: "count_limited",
  courseId: undefined as unknown as number,
  classId: 0,
  teacherId: 0,
  validFrom: "",
  validTo: "",
  totalCount: 0,
  usedCount: 0,
  remainingCount: 0,
  status: 1,
  sourceType: "manual",
});

const modalVisible = ref(false);
const formRef = ref();
const formModel = ref<StudentBenefitForm>(emptyForm());
const rules: Record<string, any> = {
  studentId: [{ required: true, message: "请输入学生ID" }],
  courseId: [{ required: true, message: "请输入课程ID" }],
  benefitType: [{ required: true, message: "请选择权益类型" }],
  calculationMode: [{ required: true, message: "请选择核算方式" }],
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getEduStudentBenefitListAPI({
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
  Object.assign(searchForm, { studentId: undefined, courseId: undefined, status: undefined });
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
  formModel.value = { ...emptyForm(), ...(record as EduStudentBenefitItem) };
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
      await editEduStudentBenefitAPI({ ...payload, id: payload.id });
    } else {
      await addEduStudentBenefitAPI(payload);
    }
    Message.success("学生权益已保存");
    await fetchList();
    resetForm();
    return true;
  } catch {
    return false;
  }
};

const checkVisible = ref(false);
const checking = ref(false);
const checkForm = reactive({ studentId: undefined as unknown as number, courseId: undefined as unknown as number, classId: 0, teacherId: 0 });
const checkResult = ref<CheckResult | null>(null);
const checkResultRows = computed(() => {
  if (!checkResult.value) return [];
  return Object.entries(checkResult.value).map(([label, value]) => ({ label, value: String(value ?? "") }));
});

const openCheckDrawer = () => {
  checkResult.value = null;
  checkVisible.value = true;
};

const handleCheck = async () => {
  if (!checkForm.studentId || !checkForm.courseId) {
    Message.warning("请输入学生ID和课程ID");
    return;
  }
  checking.value = true;
  try {
    const res = await checkEduStudentBenefitAPI({ ...checkForm });
    checkResult.value = res.data as CheckResult;
  } finally {
    checking.value = false;
  }
};

const handleRepair = async () => {
  await repairEduStudentBenefitScheduleAPI({
    studentId: searchForm.studentId,
    courseId: searchForm.courseId,
  });
  Message.success("续费修复已提交");
};

const externalSyncVisible = ref(false);
const externalSyncLoading = ref(false);
const externalSyncList = ref<EduBenefitExternalSyncItem[]>([]);
const openExternalSyncDrawer = async () => {
  externalSyncVisible.value = true;
  externalSyncLoading.value = true;
  try {
    const res = await getEduBenefitExternalSyncListAPI({ pageNum: 1, pageSize: 50 });
    externalSyncList.value = res.data.list;
  } finally {
    externalSyncLoading.value = false;
  }
};

const retrySync = async (id: number) => {
  await retryEduBenefitExternalSyncAPI({ id });
  Message.success("已加入重试");
  await openExternalSyncDrawer();
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
