<template>
  <div class="snow-page">
    <div class="snow-inner edu-setting-page">
      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-button type="primary" :loading="loading" @click="fetchConfig">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
          </a-space>
        </template>
        <template #right>
          <a-button type="primary" :loading="saving" @click="handleSave" v-hasPerm="['edu:teacherRole:save']">
            保存配置
          </a-button>
        </template>
      </s-layout-tools>

      <a-spin :loading="loading" class="setting-spin">
        <a-form :model="formModel" layout="vertical" class="setting-form">
          <a-form-item field="roleIds" label="教师角色">
            <a-select
              v-model="formModel.roleIds"
              multiple
              allow-clear
              allow-search
              placeholder="选择当前租户中可作为教师的角色"
            >
              <a-option v-for="role in roleOptions" :key="role.id" :value="role.id" :disabled="role.status !== 1">
                {{ role.name }}
              </a-option>
            </a-select>
          </a-form-item>
        </a-form>

        <a-table
          row-key="id"
          :data="roleOptions"
          :pagination="false"
          :bordered="{ cell: true }"
          :scroll="{ x: '100%', minWidth: 720 }"
        >
          <template #columns>
            <a-table-column title="角色名称" data-index="name" :width="220" />
            <a-table-column title="状态" :width="120" align="center">
              <template #cell="{ record }">
                <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? "启用" : "禁用" }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="教师角色" :width="120" align="center">
              <template #cell="{ record }">
                <a-tag v-if="selectedRoleSet.has(record.id)" color="arcoblue">是</a-tag>
                <span v-else>-</span>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref } from "vue";
import {
  getEduTeacherRoleConfigAPI,
  saveEduTeacherRoleConfigAPI,
  type EduTeacherRoleConfigRoleItem,
} from "@/api/edu";

const loading = ref(false);
const saving = ref(false);
const roleOptions = ref<EduTeacherRoleConfigRoleItem[]>([]);
const formModel = reactive({ roleIds: [] as number[] });
const selectedRoleSet = computed(() => new Set(formModel.roleIds));

const fetchConfig = async () => {
  loading.value = true;
  try {
    const res = await getEduTeacherRoleConfigAPI();
    roleOptions.value = res.data.roles || [];
    formModel.roleIds = res.data.selectedRoleIds || [];
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    await saveEduTeacherRoleConfigAPI(formModel.roleIds);
    Message.success("教师角色配置已保存");
    await fetchConfig();
  } finally {
    saving.value = false;
  }
};

onMounted(fetchConfig);
</script>

<style scoped lang="scss">
.edu-setting-page {
  .setting-spin {
    display: block;
  }

  .setting-form {
    max-width: 560px;
    margin-bottom: 16px;
  }
}
</style>
