<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="searchForm.name" placeholder="学期名称" allow-clear />
            <a-select v-model="searchForm.status" placeholder="状态" allow-clear style="width: 120px">
              <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-button type="primary" @click="handleSearch"><template #icon><icon-search /></template>查询</a-button>
            <a-button @click="handleReset"><template #icon><icon-refresh /></template>重置</a-button>
          </a-space>
        </template>
        <template #right>
          <a-space wrap>
            <a-button type="primary" @click="handleCreate" v-hasPerm="['edu:term:add']"><template #icon><icon-plus /></template>新增学期</a-button>
          </a-space>
        </template>
      </s-layout-tools>

      <a-table row-key="id" :data="dataList" :loading="loading" :pagination="pagination" :bordered="{ cell: true }" @page-change="handlePageChange" @page-size-change="handlePageSizeChange">
        <template #columns>
          <a-table-column title="学期名称" data-index="name" :width="200" fixed="left" />
          <a-table-column title="开始日期" data-index="startDate" :width="140" />
          <a-table-column title="结束日期" data-index="endDate" :width="140" />
          <a-table-column title="状态" :width="90" align="center">
            <template #cell="{ record }"><a-tag :color="record.status === 1 ? 'green' : 'red'">{{ labelOf(statusOptions, record.status) }}</a-tag></template>
          </a-table-column>
          <a-table-column title="操作" :width="220" align="center">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="openClosedDays(record)" v-hasPerm="['edu:term:edit']">停课日</a-link>
                <a-link @click="handleEdit(record)" v-hasPerm="['edu:term:edit']">编辑</a-link>
                <a-popconfirm content="确定删除该学期吗？" @ok="handleDelete(record.id)">
                  <a-link status="danger" v-hasPerm="['edu:term:delete']">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <a-modal v-model:visible="modalVisible" :title="formModel.id ? '编辑学期' : '新增学期'" :width="layoutMode.width" :on-before-ok="handleSave" @cancel="resetForm" @close="resetForm">
      <a-form ref="formRef" :model="formModel" :rules="rules" :layout="layoutMode.layout" auto-label-width>
        <a-form-item field="name" label="学期名称"><a-input v-model="formModel.name" allow-clear /></a-form-item>
        <a-form-item field="startDate" label="开始日期"><a-date-picker v-model="formModel.startDate" value-format="YYYY-MM-DD" style="width: 100%" /></a-form-item>
        <a-form-item field="endDate" label="结束日期"><a-date-picker v-model="formModel.endDate" value-format="YYYY-MM-DD" style="width: 100%" /></a-form-item>
        <a-form-item field="status" label="状态">
          <a-radio-group v-model="formModel.status"><a-radio :value="1">启用</a-radio><a-radio :value="0">停用</a-radio></a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="closedDayDrawerVisible" :width="isMobile ? '100%' : 960" :footer="false">
      <template #title>停课日 - {{ currentTerm?.name }}</template>
      <a-space direction="vertical" fill>
        <!-- closed-days -->
        <a-space wrap>
          <a-date-picker v-model="closedDayForm.closedDate" value-format="YYYY-MM-DD" placeholder="停课日期" />
          <a-input v-model="closedDayForm.reason" placeholder="原因" allow-clear />
          <a-button type="primary" @click="addClosedDay" v-hasPerm="['edu:term:edit']">添加</a-button>
          <a-button @click="saveClosedDays" v-hasPerm="['edu:term:edit']">保存停课日</a-button>
        </a-space>
        <a-table row-key="closedDate" :data="closedDayRows" :pagination="false" :bordered="{ cell: true }">
          <template #columns>
            <a-table-column title="日期" data-index="closedDate" :width="180" />
            <a-table-column title="原因" data-index="reason" />
            <a-table-column title="操作" :width="120" align="center">
              <template #cell="{ rowIndex }"><a-link status="danger" @click="removeClosedDay(rowIndex)">删除</a-link></template>
            </a-table-column>
          </template>
        </a-table>
      </a-space>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import type { TableData } from "@arco-design/web-vue/es/table/interface";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import { addEduTermAPI, deleteEduTermAPI, editEduTermAPI, getEduTermClosedDaysAPI, getEduTermListAPI, saveEduTermClosedDaysAPI, type EduTermAddParams, type EduTermClosedDayItem, type EduTermItem, type EduTermListParams } from "@/api/edu";
import { labelOf, statusOptions } from "../components/options";

const { isMobile } = useDevicesSize();
const layoutMode = computed(() => ({ width: isMobile.value ? "95%" : "640px", layout: isMobile.value ? "vertical" : "horizontal" }));
const loading = ref(false);
const dataList = ref<EduTermItem[]>([]);
const searchForm = reactive<EduTermListParams>({});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showTotal: true, showPageSize: true });
const emptyForm = (): EduTermAddParams & { id?: string } => ({ name: "", startDate: "", endDate: "", status: 1 });
const modalVisible = ref(false);
const formRef = ref();
const formModel = ref(emptyForm());
const rules = { name: [{ required: true, message: "请输入学期名称" }], startDate: [{ required: true, message: "请选择开始日期" }], endDate: [{ required: true, message: "请选择结束日期" }] };
const fetchList = async () => { loading.value = true; try { const res = await getEduTermListAPI({ ...searchForm, pageNum: pagination.current, pageSize: pagination.pageSize }); dataList.value = res.data.list; pagination.total = res.data.total; } finally { loading.value = false; } };
const handleSearch = () => { pagination.current = 1; fetchList(); };
const handleReset = () => { Object.assign(searchForm, { name: undefined, status: undefined }); handleSearch(); };
const handlePageChange = (page: number) => { pagination.current = page; fetchList(); };
const handlePageSizeChange = (pageSize: number) => { pagination.pageSize = pageSize; pagination.current = 1; fetchList(); };
const handleCreate = () => { formModel.value = emptyForm(); modalVisible.value = true; };
const handleEdit = (record: TableData) => { formModel.value = { ...emptyForm(), ...(record as EduTermItem) }; modalVisible.value = true; };
const resetForm = () => { formRef.value?.resetFields?.(); formModel.value = emptyForm(); };
const handleSave = async () => { try { const errors = await formRef.value?.validate?.(); if (errors) return false; const payload = formModel.value; if (payload.id) await editEduTermAPI({ ...payload, id: payload.id }); else await addEduTermAPI(payload); Message.success("学期保存成功"); await fetchList(); resetForm(); return true; } catch { return false; } };
const handleDelete = async (id: string) => { await deleteEduTermAPI({ id }); Message.success("学期删除成功"); fetchList(); };
const currentTerm = ref<EduTermItem | null>(null);
const closedDayDrawerVisible = ref(false);
const closedDayRows = ref<EduTermClosedDayItem[]>([]);
const closedDayForm = ref({ closedDate: "", reason: "" });
const openClosedDays = async (record: EduTermItem) => { currentTerm.value = record; closedDayDrawerVisible.value = true; const res = await getEduTermClosedDaysAPI(record.id); closedDayRows.value = res.data.list || []; };
const addClosedDay = () => { if (!closedDayForm.value.closedDate) return; closedDayRows.value.push({ closedDate: closedDayForm.value.closedDate, reason: closedDayForm.value.reason }); closedDayForm.value = { closedDate: "", reason: "" }; };
const removeClosedDay = (index: number) => { closedDayRows.value.splice(index, 1); };
const saveClosedDays = async () => { if (!currentTerm.value) return; await saveEduTermClosedDaysAPI(currentTerm.value.id, closedDayRows.value); Message.success("停课日已保存"); };
onMounted(fetchList);
</script>
