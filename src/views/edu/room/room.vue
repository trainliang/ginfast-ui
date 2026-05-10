<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="searchForm.name" placeholder="场地名称" allow-clear />
            <a-input v-model="searchForm.code" placeholder="编码" allow-clear />
            <a-select v-model="searchForm.type" placeholder="类型" allow-clear style="width: 140px">
              <a-option v-for="item in roomTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
              <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-input v-model="searchForm.location" placeholder="位置" allow-clear />
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
            <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:room:add']">
              <template #icon><icon-plus /></template>
              新增场地
            </a-button>
            <a-button @click="importVisible = true" v-hasPerm="['edu:room:import']">导入</a-button>
            <a-button @click="handleExport" v-hasPerm="['edu:room:export']">导出</a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table
        row-key="id"
        :data="dataList"
        :loading="loading"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', minWidth: 1150 }"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="名称" data-index="name" :width="180" fixed="left" ellipsis tooltip />
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="类型" :width="120" align="center">
            <template #cell="{ record }">{{ labelOf(roomTypeOptions, record.type) }}</template>
          </a-table-column>
          <a-table-column title="容量" data-index="capacity" :width="90" align="center" />
          <a-table-column title="位置" data-index="location" :width="180" ellipsis tooltip />
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ labelOf(statusOptions, record.status) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="备注" data-index="remark" :width="240" ellipsis tooltip />
          <a-table-column title="操作" :width="260" align="center" :fixed="isMobile ? '' : 'right'">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="openTimeDrawer(record)" v-hasPerm="['edu:room:time']">开放时间</a-link>
                <a-link @click="handleEdit(record)" v-hasPerm="['edu:room:edit']">编辑</a-link>
                <a-popconfirm content="确定删除该场地吗？" @ok="handleDelete(record.id)">
                  <a-link status="danger" v-hasPerm="['edu:room:delete']">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:visible="modalVisible"
      :title="formModel.id ? '编辑场地' : '新增场地'"
      :width="layoutMode.width"
      :on-before-ok="handleSave"
      @cancel="resetForm"
      @close="resetForm"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="场地名称">
          <a-input v-model="formModel.name" placeholder="请输入场地名称" allow-clear />
        </a-form-item>
        <a-form-item field="code" label="编码">
          <a-input v-model="formModel.code" placeholder="请输入编码" allow-clear />
        </a-form-item>
        <a-form-item field="type" label="类型">
          <a-select v-model="formModel.type" placeholder="请选择类型" allow-clear>
            <a-option v-for="item in roomTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="capacity" label="容量">
          <a-input-number v-model="formModel.capacity" :min="0" />
        </a-form-item>
        <a-form-item field="location" label="位置">
          <a-input v-model="formModel.location" placeholder="请输入位置" allow-clear />
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

    <a-drawer v-model:visible="timeDrawerVisible" :width="isMobile ? '100%' : 1120" :footer="false" @close="closeTimeDrawer">
      <template #title>场地开放时间 - {{ currentRoom?.name }}</template>
      <a-spin :loading="weeklyLoading || exceptionLoading" class="room-time-spin">
        <a-space direction="vertical" fill size="large">
        <a-card title="周规则" :bordered="true">
          <template #extra>
            <a-space>
              <a-button size="small" @click="addWeeklyRule" v-hasPerm="['edu:room:time']">新增周规则</a-button>
              <a-button size="small" type="primary" :loading="weeklySaving" @click="saveWeeklyRules" v-hasPerm="['edu:room:time']">
                保存周规则
              </a-button>
            </a-space>
          </template>

          <a-table row-key="localKey" :data="weeklyRuleDrafts" :pagination="false" :bordered="{ cell: true }" size="small">
            <template #columns>
              <a-table-column title="星期" :width="120">
                <template #cell="{ record }">
                  <a-select v-model="record.weekday" placeholder="星期" style="width: 100%">
                    <a-option v-for="item in weekdayOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
                  </a-select>
                </template>
              </a-table-column>
              <a-table-column title="开始时间" :width="140">
                <template #cell="{ record }">
                  <a-time-picker v-model="record.startTime" format="HH:mm" style="width: 100%" />
                </template>
              </a-table-column>
              <a-table-column title="结束时间" :width="140">
                <template #cell="{ record }">
                  <a-time-picker v-model="record.endTime" format="HH:mm" style="width: 100%" />
                </template>
              </a-table-column>
              <a-table-column title="可用" :width="100" align="center">
                <template #cell="{ record }">
                  <a-switch v-model="record.available" :checked-value="1" :unchecked-value="0" />
                </template>
              </a-table-column>
              <a-table-column title="备注">
                <template #cell="{ record }">
                  <a-input v-model="record.remark" placeholder="备注" allow-clear />
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="100" align="center">
                <template #cell="{ rowIndex }">
                  <a-link status="danger" @click="removeWeeklyRule(rowIndex)">删除</a-link>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>

        <a-card title="例外日期" :bordered="true">
          <template #extra>
            <a-button size="small" type="primary" @click="openExceptionModal()" v-hasPerm="['edu:room:time']">新增例外</a-button>
          </template>

          <a-table row-key="id" :data="exceptionList" :loading="exceptionLoading" :pagination="false" :bordered="{ cell: true }" size="small">
            <template #columns>
              <a-table-column title="日期" data-index="exceptionDate" :width="140" />
              <a-table-column title="类型" :width="120" align="center">
                <template #cell="{ record }">{{ labelOf(roomExceptionTypeOptions, record.type) }}</template>
              </a-table-column>
              <a-table-column title="开始时间" :width="120">
                <template #cell="{ record }">{{ record.startTime || '-' }}</template>
              </a-table-column>
              <a-table-column title="结束时间" :width="120">
                <template #cell="{ record }">{{ record.endTime || '-' }}</template>
              </a-table-column>
              <a-table-column title="原因" data-index="reason" ellipsis tooltip />
              <a-table-column title="操作" :width="160" align="center">
                <template #cell="{ record }">
                  <a-space>
                    <a-link @click="openExceptionModal(record)" v-hasPerm="['edu:room:time']">编辑</a-link>
                    <a-popconfirm content="确定删除该例外日期吗？" @ok="deleteException(record.id)">
                      <a-link status="danger" v-hasPerm="['edu:room:time']">删除</a-link>
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
        </a-space>
      </a-spin>
    </a-drawer>

    <a-modal
      v-model:visible="exceptionModalVisible"
      :title="exceptionForm.id ? '编辑例外日期' : '新增例外日期'"
      :width="layoutMode.width"
      :on-before-ok="saveException"
      @cancel="resetExceptionForm"
      @close="resetExceptionForm"
    >
      <a-form ref="exceptionFormRef" :model="exceptionForm" :rules="exceptionRules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="exceptionDate" label="例外日期">
          <a-date-picker v-model="exceptionForm.exceptionDate" placeholder="请选择日期" style="width: 100%" />
        </a-form-item>
        <a-form-item field="type" label="类型">
          <a-select v-model="exceptionForm.type" placeholder="请选择类型">
            <a-option v-for="item in roomExceptionTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="startTime" label="开始时间">
          <a-time-picker v-model="exceptionForm.startTime" format="HH:mm" style="width: 100%" />
        </a-form-item>
        <a-form-item field="endTime" label="结束时间">
          <a-time-picker v-model="exceptionForm.endTime" format="HH:mm" style="width: 100%" />
        </a-form-item>
        <a-form-item field="reason" label="原因">
          <a-textarea v-model="exceptionForm.reason" placeholder="请输入原因" />
        </a-form-item>
      </a-form>
    </a-modal>

    <import-dialog
      v-model:visible="importVisible"
      title="导入场地"
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
  addEduRoomAPI,
  addEduRoomExceptionAPI,
  deleteEduRoomAPI,
  deleteEduRoomExceptionAPI,
  editEduRoomAPI,
  editEduRoomExceptionAPI,
  exportEduRoomAPI,
  getEduRoomExceptionsAPI,
  getEduRoomListAPI,
  getEduRoomWeeklyRulesAPI,
  importEduRoomAPI,
  saveEduRoomWeeklyRulesAPI,
  type EduRoomAddParams,
  type EduRoomException,
  type EduRoomImportRow,
  type EduRoomItem,
  type EduRoomListParams,
  type EduRoomWeeklyRule,
} from "@/api/edu";
import ImportDialog from "../components/import-dialog.vue";
import { exportRowsToXlsx, type ExportColumn } from "../components/export-tools";
import { labelOf, roomExceptionTypeOptions, roomTypeOptions, statusOptions, weekdayOptions } from "../components/options";

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({ width: isMobile.value ? "95%" : "720px", layout: isMobile.value ? "vertical" : "horizontal" }));

const loading = ref(false);
const dataList = ref<EduRoomItem[]>([]);
const searchForm = reactive<EduRoomListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });

const emptyForm = (): EduRoomAddParams & { id?: number } => ({
  name: "",
  code: "",
  type: "",
  capacity: 0,
  location: "",
  status: 1,
  remark: "",
});

const modalVisible = ref(false);
const formRef = ref();
const formModel = ref(emptyForm());
const rules: Record<string, any> = {
  name: [{ required: true, message: "请输入场地名称" }],
  code: [{ required: true, message: "请输入编码" }],
};

const exportColumns: ExportColumn<Record<string, unknown>>[] = [
  { title: "名称", key: "name" },
  { title: "编码", key: "code" },
  { title: "类型", key: "type" },
  { title: "容量", key: "capacity" },
  { title: "位置", key: "location" },
  { title: "状态", key: "status" },
  { title: "备注", key: "remark" },
];

const importVisible = ref(false);
const importLoading = ref(false);
const importResult = ref();

const currentRoom = ref<EduRoomItem | null>(null);
const timeDrawerVisible = ref(false);
const weeklyLoading = ref(false);
const weeklySaving = ref(false);
const weeklyRuleDrafts = ref<(EduRoomWeeklyRule & { localKey: string })[]>([]);
const exceptionLoading = ref(false);
const exceptionList = ref<EduRoomException[]>([]);

const exceptionModalVisible = ref(false);
const exceptionFormRef = ref();
const exceptionForm = ref<EduRoomException & { localKey?: string }>({
  exceptionDate: "",
  type: "open",
  startTime: "",
  endTime: "",
  reason: "",
});
const exceptionRules: Record<string, any> = {
  exceptionDate: [{ required: true, message: "请选择例外日期" }],
  type: [{ required: true, message: "请选择类型" }],
};

const makeLocalKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeTime = (value?: string) => (value ? value.slice(0, 5) : "");

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getEduRoomListAPI({ ...searchForm, pageNum: pagination.current, pageSize: pagination.pageSize });
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
  Object.assign(searchForm, { name: undefined, code: undefined, type: undefined, status: undefined, location: undefined });
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
  formModel.value = { ...emptyForm(), ...(record as EduRoomItem) };
  modalVisible.value = true;
};

const resetForm = () => {
  formRef.value?.resetFields?.();
  formModel.value = emptyForm();
};

const handleSave = async () => {
  const errors = await formRef.value?.validate?.();
  if (errors) return false;

  const payload = formModel.value;
  if (payload.id) {
    await editEduRoomAPI({ ...payload, id: payload.id });
    Message.success("场地更新成功");
  } else {
    await addEduRoomAPI(payload);
    Message.success("场地创建成功");
  }
  await fetchList();
  resetForm();
  return true;
};

const handleDelete = async (id: number) => {
  await deleteEduRoomAPI({ id });
  Message.success("场地删除成功");
  fetchList();
};

const handleExport = async () => {
  const res = await exportEduRoomAPI();
  exportRowsToXlsx(res.data.list as unknown as Record<string, unknown>[], exportColumns, "场地数据.xlsx", "场地");
};

const handleDownloadTemplate = () => {
  exportRowsToXlsx([], exportColumns, "场地导入模板.xlsx", "场地模板");
};

const handleImport = async (rows: Record<string, unknown>[]) => {
  importLoading.value = true;
  try {
    const res = await importEduRoomAPI(rows as EduRoomImportRow[]);
    importResult.value = res.data;
    Message.success(`导入完成，成功 ${res.data.successCount} 行`);
    importVisible.value = false;
    await fetchList();
  } finally {
    importLoading.value = false;
  }
};

const loadRoomTimeData = async (roomId: number) => {
  weeklyLoading.value = true;
  exceptionLoading.value = true;
  try {
    const [weeklyRes, exceptionRes] = await Promise.all([getEduRoomWeeklyRulesAPI(roomId), getEduRoomExceptionsAPI(roomId)]);
    weeklyRuleDrafts.value = (weeklyRes.data.list ?? []).map((row) => ({
      ...row,
      localKey: String(row.id ?? makeLocalKey()),
      startTime: normalizeTime(row.startTime),
      endTime: normalizeTime(row.endTime),
      available: row.available ?? 1,
      remark: row.remark ?? "",
    }));
    exceptionList.value = exceptionRes.data.list ?? [];
  } finally {
    weeklyLoading.value = false;
    exceptionLoading.value = false;
  }
};

const openTimeDrawer = async (record: TableData) => {
  currentRoom.value = record as EduRoomItem;
  timeDrawerVisible.value = true;
  await loadRoomTimeData((record as EduRoomItem).id);
};

const closeTimeDrawer = () => {
  timeDrawerVisible.value = false;
  currentRoom.value = null;
  weeklyRuleDrafts.value = [];
  exceptionList.value = [];
};

const addWeeklyRule = () => {
  weeklyRuleDrafts.value.push({
    localKey: makeLocalKey(),
    weekday: 1,
    startTime: "08:00",
    endTime: "22:00",
    available: 1,
    remark: "",
  });
};

const removeWeeklyRule = (rowIndex: number) => {
  weeklyRuleDrafts.value.splice(rowIndex, 1);
};

const saveWeeklyRules = async () => {
  if (!currentRoom.value) return;
  weeklySaving.value = true;
  try {
    const rows: EduRoomWeeklyRule[] = weeklyRuleDrafts.value.map(({ localKey, ...row }) => ({
      ...row,
      roomId: currentRoom.value?.id,
      startTime: normalizeTime(row.startTime),
      endTime: normalizeTime(row.endTime),
    }));
    await saveEduRoomWeeklyRulesAPI(currentRoom.value.id, rows);
    Message.success("周规则保存成功");
    await loadRoomTimeData(currentRoom.value.id);
  } finally {
    weeklySaving.value = false;
  }
};

const resetExceptionForm = () => {
  exceptionFormRef.value?.resetFields?.();
  exceptionForm.value = {
    exceptionDate: "",
    type: "open",
    startTime: "",
    endTime: "",
    reason: "",
  };
};

const openExceptionModal = (record?: EduRoomException) => {
  if (record) {
    exceptionForm.value = { ...record };
  } else {
    resetExceptionForm();
  }
  exceptionModalVisible.value = true;
};

const saveException = async () => {
  if (!currentRoom.value) return false;
  const errors = await exceptionFormRef.value?.validate?.();
  if (errors) return false;

  const payload = {
    ...exceptionForm.value,
    startTime: normalizeTime(exceptionForm.value.startTime),
    endTime: normalizeTime(exceptionForm.value.endTime),
  } as EduRoomException;

  if (payload.id) {
    await editEduRoomExceptionAPI(currentRoom.value.id, payload);
    Message.success("例外日期更新成功");
  } else {
    await addEduRoomExceptionAPI(currentRoom.value.id, payload);
    Message.success("例外日期新增成功");
  }

  exceptionModalVisible.value = false;
  resetExceptionForm();
  await loadRoomTimeData(currentRoom.value.id);
  return true;
};

const deleteException = async (id?: number) => {
  if (!currentRoom.value || !id) return;
  await deleteEduRoomExceptionAPI(currentRoom.value.id, { id });
  Message.success("例外日期删除成功");
  await loadRoomTimeData(currentRoom.value.id);
};

onMounted(() => {
  fetchList();
});
</script>
