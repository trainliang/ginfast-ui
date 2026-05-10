<template>
  <a-modal
    v-model:visible="modalVisible"
    :title="title"
    :mask-closable="false"
    :footer="false"
    :width="isMobile ? '96%' : 880"
    @cancel="handleClose"
    @close="handleClose"
  >
    <a-space direction="vertical" fill size="large" class="import-dialog">
      <section class="import-dialog__reader">
        <s-excel-reader
          :title="readerTitle"
          :description="readerDescription"
          :multiple="false"
          @success="handleReaderSuccess"
          @error="handleReaderError"
          @loading="handleReaderLoading"
        />
      </section>

      <a-alert
        v-if="parsedRowCount > 0"
        type="success"
        :show-icon="true"
      >
        已读取 {{ parsedRowCount }} 行数据，确认后将提交给父组件处理。
      </a-alert>

      <a-alert
        v-else-if="readerError"
        type="error"
        :show-icon="true"
      >
        {{ readerError }}
      </a-alert>

      <section v-if="templateColumns.length > 0" class="import-dialog__template">
        <div class="section-title">模板字段</div>
        <a-space wrap size="mini">
          <a-tag
            v-for="column in templateColumns"
            :key="String(column.key)"
            color="arcoblue"
          >
            {{ column.title }}
          </a-tag>
        </a-space>
      </section>

      <section v-if="showResultSummary || mergedErrors.length > 0" class="import-dialog__result">
        <div class="section-title">导入结果</div>
        <a-space wrap size="medium" class="result-summary">
          <a-tag v-if="showResultSummary" color="green">
            成功 {{ successCount }} 行
          </a-tag>
          <a-tag v-if="showResultSummary && failedCount > 0" color="red">
            失败 {{ failedCount }} 行
          </a-tag>
        </a-space>

        <a-alert
          v-if="resultMessage"
          class="result-message"
          type="warning"
          :show-icon="true"
        >
          {{ resultMessage }}
        </a-alert>

        <a-table
          v-if="mergedErrors.length > 0"
          :data="mergedErrors"
          :pagination="false"
          :bordered="{ cell: true }"
          size="small"
          row-key="rowNo"
        >
          <template #columns>
            <a-table-column title="行号" data-index="rowNo" :width="90" align="center" />
            <a-table-column title="字段" data-index="field" :width="160">
              <template #cell="{ record }">
                {{ record.field || '-' }}
              </template>
            </a-table-column>
            <a-table-column title="错误原因" data-index="reason" :ellipsis="true" tooltip />
          </template>
        </a-table>
      </section>

      <div class="import-dialog__footer">
        <a-space>
          <a-button @click="handleDownloadTemplate">下载模板</a-button>
          <a-button @click="handleClose">取消</a-button>
          <a-button
            type="primary"
            :loading="loading || readerLoading"
            :disabled="parsedRows.length === 0 || loading || readerLoading"
            @click="handleSubmit"
          >
            确认导入
          </a-button>
        </a-space>
      </div>
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDevicesSize } from '@/hooks/useDevicesSize';
import type { ExportColumn } from './export-tools';

interface ImportRowError {
  rowNo: number;
  field?: string;
  reason: string;
}

interface ImportResult<T extends Record<string, unknown> = Record<string, unknown>> {
  rows?: T[];
  errors?: ImportRowError[];
  total?: number;
  successCount?: number;
  failedCount?: number;
  message?: string;
}

interface ExcelSheetData {
  sheetName: string;
  data: Record<string, unknown>[];
  headers: string[];
}

type ImportRow = Record<string, unknown>;

interface Props {
  visible: boolean;
  title?: string;
  templateColumns?: ExportColumn<ImportRow>[];
  loading?: boolean;
  errors?: ImportRowError[];
  result?: ImportResult<ImportRow> | null;
}

const props = withDefaults(defineProps<Props>(), {
  title: '导入数据',
  templateColumns: () => [],
  loading: false,
  errors: () => [],
  result: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'submit', rows: ImportRow[]): void;
  (e: 'download-template'): void;
}>();

const { isMobile } = useDevicesSize();

const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const readerTitle = '点击或拖拽上传 Excel 文件';
const readerDescription = '支持 .xlsx、.xls 格式，上传后可在此确认导入数据。';

const readerLoading = ref(false);
const readerError = ref('');
const parsedRows = ref<ImportRow[]>([]);

const mergedErrors = computed(() => props.result?.errors ?? props.errors ?? []);
const successCount = computed(() => {
  if (typeof props.result?.successCount === 'number') {
    return props.result.successCount;
  }

  if (typeof props.result?.total === 'number') {
    return props.result.total - (props.result.failedCount ?? 0);
  }

  return parsedRows.value.length;
});
const failedCount = computed(() => props.result?.failedCount ?? mergedErrors.value.length);
const resultMessage = computed(() => props.result?.message ?? '');
const showResultSummary = computed(() => successCount.value > 0 || failedCount.value > 0 || Boolean(resultMessage.value));
const parsedRowCount = computed(() => parsedRows.value.length);

const resetLocalState = (): void => {
  readerLoading.value = false;
  readerError.value = '';
  parsedRows.value = [];
};

const handleClose = (): void => {
  emit('update:visible', false);
  resetLocalState();
};

const handleDownloadTemplate = (): void => {
  emit('download-template');
};

const handleSubmit = (): void => {
  if (parsedRows.value.length === 0) {
    return;
  }

  emit('submit', parsedRows.value);
};

const normalizeRows = (data: ExcelSheetData | ExcelSheetData[]): ImportRow[] => {
  const sheets = Array.isArray(data) ? data : [data];
  return sheets.flatMap((sheet) => sheet.data.filter((row): row is ImportRow => Boolean(row) && typeof row === 'object'));
};

const handleReaderSuccess = (data: ExcelSheetData | ExcelSheetData[]): void => {
  parsedRows.value = normalizeRows(data);
  readerError.value = '';
};

const handleReaderError = (error: Error): void => {
  readerError.value = error.message || '读取 Excel 文件失败';
  parsedRows.value = [];
};

const handleReaderLoading = (value: boolean): void => {
  readerLoading.value = value;
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetLocalState();
    }
  }
);
</script>

<style scoped lang="scss">
.import-dialog {
  width: 100%;
}

.import-dialog__reader {
  min-height: 240px;
}

.import-dialog__template,
.import-dialog__result {
  padding: 16px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: var(--color-fill-1);
}

.section-title {
  margin-bottom: 12px;
  color: var(--color-text-1);
  font-size: 14px;
  font-weight: 600;
}

.result-summary {
  margin-bottom: 12px;
}

.result-message {
  margin-bottom: 12px;
}

.import-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
