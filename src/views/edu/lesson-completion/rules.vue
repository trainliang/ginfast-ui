<template>
  <div class="snow-page">
    <div class="snow-inner edu-page lesson-rules-page">
      <div class="rules-hero">
        <div class="rules-hero__main">
          <div class="rules-hero__tag">消课管理</div>
          <div class="rules-hero__title">消课规则</div>
          <div class="rules-hero__subtitle">配置当前租户的消课规则。未单独配置时，系统按默认规则执行。</div>
        </div>
        <div class="rules-hero__tips">
          <a-alert type="info" :show-icon="true">
            系统固定提供 6 类消课结果，未配置项按默认规则执行。
          </a-alert>
          <a-alert type="warning" :show-icon="true">
            保存后立即作用于当前租户。
          </a-alert>
        </div>
      </div>

      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <a-input v-model="keyword" allow-clear placeholder="搜索结果类型 / 备注" style="width: 260px" />
            <a-select v-model="filterForm.insufficientPolicy" allow-clear placeholder="权益不足策略" style="width: 180px">
              <a-option v-for="item in insufficientPolicyOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-select v-model="filterForm.deductMode" allow-clear placeholder="扣减方式" style="width: 180px">
              <a-option v-for="item in deductModeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
            <a-button :loading="loading" @click="fetchRules">
              <template #icon><icon-refresh /></template>
              刷新
            </a-button>
            <a-button type="primary" @click="openFirstVisibleRow" :disabled="visibleRules.length === 0" v-hasPerm="['edu:lessonCompletion:rule']">
              编辑规则
            </a-button>
          </a-space>
        </template>
        <template #right>
          <a-space wrap>
            <a-tag color="arcoblue">{{ rules.length }} 条固定规则</a-tag>
            <a-tag color="green">{{ enabledRuleCount }} 条启用扣减</a-tag>
            <a-tag color="orange">{{ defaultRuleCount }} 条使用默认</a-tag>
          </a-space>
        </template>
      </s-layout-tools>

      <a-card class="rules-card" :bordered="false">
        <a-table row-key="resultType" :data="visibleRules" :loading="loading" :bordered="{ cell: true }" :pagination="false">
          <template #columns>
            <a-table-column title="结果类型" :width="160">
              <template #cell="{ record }">{{ resultTypeText(record.resultType) }}</template>
            </a-table-column>
            <a-table-column title="来源" :width="100" align="center">
              <template #cell="{ record }">
                <a-tag :color="ruleSourceColor(record)">{{ ruleSourceText(record) }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="是否扣减" :width="100" align="center">
              <template #cell="{ record }">
                <a-tag :color="record.deductEnabled ? 'green' : 'gray'">{{ record.deductEnabled ? "扣减" : "不扣减" }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="扣减方式" :width="120" align="center">
              <template #cell="{ record }">{{ deductModeText(record.deductMode) }}</template>
            </a-table-column>
            <a-table-column title="扣减值" :width="140" align="center">
              <template #cell="{ record }">{{ deductValueText(record) }}</template>
            </a-table-column>
            <a-table-column title="权益不足" :width="140" align="center">
              <template #cell="{ record }">{{ insufficientPolicyText(record.insufficientPolicy) }}</template>
            </a-table-column>
            <a-table-column title="备注" data-index="remark" ellipsis tooltip />
            <a-table-column title="操作" :width="120" align="center" fixed="right">
              <template #cell="{ record }">
                <a-button type="text" @click="openEditor(record)" v-hasPerm="['edu:lessonCompletion:rule']">编辑</a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>

      <a-drawer v-model:visible="editorVisible" :width="isMobile ? '100%' : 560" :footer="false" @close="resetEditor">
        <template #title>编辑消课规则</template>
        <a-form ref="formRef" :model="formModel" :rules="formRules" auto-label-width layout="vertical">
          <a-form-item field="resultType" label="结果类型">
            <a-input :model-value="resultTypeText(formModel.resultType)" disabled />
          </a-form-item>
          <a-form-item field="deductEnabled" label="是否扣减">
            <a-radio-group v-model="formModel.deductEnabled">
              <a-radio :value="1">扣减</a-radio>
              <a-radio :value="0">不扣减</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item field="deductMode" label="扣减方式">
            <a-select v-model="formModel.deductMode" :disabled="formModel.deductEnabled !== 1">
              <a-option v-for="item in deductModeOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="formModel.deductEnabled === 1 && formModel.deductMode === 'fixed_count'" field="fixedCount" label="固定次数">
            <a-input-number v-model="formModel.fixedCount" :min="1" :precision="0" style="width: 100%" />
          </a-form-item>
          <a-form-item v-if="formModel.deductEnabled === 1 && formModel.deductMode === 'duration'" field="durationUnitMinutes" label="时长单位（分钟）">
            <a-input-number v-model="formModel.durationUnitMinutes" :min="1" :precision="0" style="width: 100%" />
          </a-form-item>
          <a-form-item field="insufficientPolicy" label="权益不足策略">
            <a-select v-model="formModel.insufficientPolicy" :disabled="formModel.deductEnabled !== 1">
              <a-option v-for="item in insufficientPolicyOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="remark" label="备注">
            <a-textarea v-model="formModel.remark" :max-length="200" allow-clear placeholder="补充说明该规则适用场景" />
          </a-form-item>
        </a-form>

        <div class="drawer-actions">
          <a-space>
            <a-button @click="editorVisible = false">取消</a-button>
            <a-button type="primary" :loading="saving" @click="submitForm" v-hasPerm="['edu:lessonCompletion:rule:save']">保存规则</a-button>
          </a-space>
        </div>
      </a-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import {
  getEduLessonCompletionRulesAPI,
  saveEduLessonCompletionRulesAPI,
  type EduLessonCompletionRuleItem,
  type EduLessonCompletionResultType,
} from "@/api/edu/lesson-completion";

type RuleFormModel = Required<
  Pick<
    EduLessonCompletionRuleItem,
    "resultType" | "deductEnabled" | "deductMode" | "fixedCount" | "durationUnitMinutes" | "insufficientPolicy" | "remark"
  >
>;

const { isMobile } = useDevicesSize();

const resultTypeOptions: Array<{ label: string; value: EduLessonCompletionResultType }> = [
  { label: "已上课", value: "attended" },
  { label: "学生请假", value: "student_leave" },
  { label: "学生旷课", value: "student_absent" },
  { label: "教师停课", value: "teacher_stopped" },
  { label: "机构取消", value: "institution_canceled" },
  { label: "补课已补", value: "makeup_completed" },
];

const deductModeOptions = [
  { label: "按固定次数", value: "fixed_count" },
  { label: "按时长单位", value: "duration" },
] as const;

const insufficientPolicyOptions = [
  { label: "阻断处理", value: "block" },
  { label: "允许欠费", value: "allow_arrears" },
] as const;

const keyword = ref("");
const loading = ref(false);
const saving = ref(false);
const editorVisible = ref(false);
const rules = ref<EduLessonCompletionRuleItem[]>([]);
const currentRuleType = ref<EduLessonCompletionResultType | "">("");
const formRef = ref();

const filterForm = reactive<{
  insufficientPolicy?: "block" | "allow_arrears";
  deductMode?: "fixed_count" | "duration";
}>({});

const formModel = reactive<RuleFormModel>({
  resultType: "attended",
  deductEnabled: 1,
  deductMode: "fixed_count",
  fixedCount: 1,
  durationUnitMinutes: 60,
  insufficientPolicy: "block",
  remark: "",
});

const formRules = {
  deductMode: [{ required: true, message: "请选择扣减方式" }],
  fixedCount: [
    {
      validator: (value: number, callback: (message?: string) => void) => {
        if (formModel.deductEnabled === 1 && formModel.deductMode === "fixed_count" && (!value || value < 1)) {
          callback("请输入大于 0 的固定次数");
          return;
        }
        callback();
      },
    },
  ],
  durationUnitMinutes: [
    {
      validator: (value: number, callback: (message?: string) => void) => {
        if (formModel.deductEnabled === 1 && formModel.deductMode === "duration" && (!value || value < 1)) {
          callback("请输入大于 0 的时长单位");
          return;
        }
        callback();
      },
    },
  ],
  insufficientPolicy: [{ required: true, message: "请选择权益不足策略" }],
};

const enabledRuleCount = computed(() => rules.value.filter((item) => item.deductEnabled === 1).length);
const defaultRuleCount = computed(() => rules.value.filter((item) => ruleSourceText(item) === "默认").length);

const visibleRules = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase();
  return rules.value.filter((item) => {
    const matchKeyword =
      !normalizedKeyword ||
      resultTypeText(item.resultType).toLowerCase().includes(normalizedKeyword) ||
      (item.remark || "").toLowerCase().includes(normalizedKeyword);
    const matchPolicy = !filterForm.insufficientPolicy || item.insufficientPolicy === filterForm.insufficientPolicy;
    const matchMode = !filterForm.deductMode || item.deductMode === filterForm.deductMode;
    return matchKeyword && matchPolicy && matchMode;
  });
});

watch(
  () => [formModel.deductEnabled, formModel.deductMode],
  () => {
    if (formModel.deductEnabled !== 1) {
      formModel.insufficientPolicy = "block";
    }
    if (formModel.deductMode === "fixed_count" && (!formModel.fixedCount || formModel.fixedCount < 1)) {
      formModel.fixedCount = 1;
    }
    if (formModel.deductMode === "duration" && (!formModel.durationUnitMinutes || formModel.durationUnitMinutes < 1)) {
      formModel.durationUnitMinutes = 60;
    }
  }
);

function resultTypeText(value?: EduLessonCompletionResultType) {
  return resultTypeOptions.find((item) => item.value === value)?.label ?? "-";
}

function deductModeText(value?: "fixed_count" | "duration") {
  return deductModeOptions.find((item) => item.value === value)?.label ?? "-";
}

function insufficientPolicyText(value?: "block" | "allow_arrears") {
  return insufficientPolicyOptions.find((item) => item.value === value)?.label ?? "-";
}

function deductValueText(record: EduLessonCompletionRuleItem) {
  if (record.deductEnabled !== 1) return "不扣减";
  if (record.deductMode === "duration") return `${record.durationUnitMinutes || 0} 分钟`;
  return `${record.fixedCount || 0} 次`;
}

function ruleSourceText(record: EduLessonCompletionRuleItem) {
  if (record.source) {
    return record.source === "tenant" ? "已配置" : "默认";
  }
  return record.id ? "已配置" : "默认";
}

function ruleSourceColor(record: EduLessonCompletionRuleItem) {
  return ruleSourceText(record) === "已配置" ? "green" : "orange";
}

function normalizeRule(record: EduLessonCompletionRuleItem): EduLessonCompletionRuleItem {
  const deductEnabled = record.deductEnabled === 1 ? 1 : 0;
  const deductMode = record.deductMode || "fixed_count";
  const source = record.source || (record.id ? "tenant" : "default");
  return {
    ...record,
    deductEnabled,
    deductMode,
    fixedCount: deductMode === "fixed_count" ? Math.max(1, record.fixedCount || 1) : 0,
    durationUnitMinutes: deductMode === "duration" ? Math.max(1, record.durationUnitMinutes || 60) : 0,
    insufficientPolicy: deductEnabled === 1 ? record.insufficientPolicy || "block" : "block",
    remark: record.remark || "",
    source,
  };
}

async function fetchRules() {
  loading.value = true;
  try {
    const res = await getEduLessonCompletionRulesAPI();
    rules.value = (res.data.list || []).map(normalizeRule);
  } finally {
    loading.value = false;
  }
}

function openEditor(record: EduLessonCompletionRuleItem) {
  const normalized = normalizeRule(record);
  currentRuleType.value = normalized.resultType;
  Object.assign(formModel, {
    resultType: normalized.resultType,
    deductEnabled: normalized.deductEnabled || 0,
    deductMode: normalized.deductMode || "fixed_count",
    fixedCount: normalized.fixedCount || 1,
    durationUnitMinutes: normalized.durationUnitMinutes || 60,
    insufficientPolicy: normalized.insufficientPolicy || "block",
    remark: normalized.remark || "",
  });
  editorVisible.value = true;
}

function openFirstVisibleRow() {
  if (visibleRules.value.length === 0) return;
  openEditor(visibleRules.value[0]);
}

function resetEditor() {
  formRef.value?.clearValidate();
  currentRuleType.value = "";
}

function buildSavePayload() {
  return rules.value.map((item) => {
    if (item.resultType !== currentRuleType.value) return item;
    return normalizeRule({
      ...item,
      deductEnabled: formModel.deductEnabled,
      deductMode: formModel.deductMode,
      fixedCount: formModel.fixedCount,
      durationUnitMinutes: formModel.durationUnitMinutes,
      insufficientPolicy: formModel.insufficientPolicy,
      remark: formModel.remark?.trim(),
    });
  });
}

async function submitForm() {
  const error = await formRef.value?.validate();
  if (error) return;
  saving.value = true;
  try {
    await saveEduLessonCompletionRulesAPI({ items: buildSavePayload() });
    await fetchRules();
    editorVisible.value = false;
    Message.success("消课规则已保存");
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void fetchRules();
});
</script>

<style scoped lang="scss">
.lesson-rules-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rules-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.14), transparent 34%),
    linear-gradient(135deg, #0f172a 0%, #155e75 44%, #0ea5e9 100%);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.14);
}

.rules-hero__tag {
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.rules-hero__title {
  margin-top: 12px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}

.rules-hero__subtitle {
  max-width: 640px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.7;
}

.rules-hero__tips {
  display: grid;
  gap: 12px;
  align-content: start;
}

.rules-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 960px) {
  .rules-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .rules-hero {
    padding: 18px;
  }

  .rules-hero__title {
    font-size: 24px;
  }
}
</style>
