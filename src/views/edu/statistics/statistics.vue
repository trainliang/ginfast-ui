<template>
  <div class="snow-page">
    <div class="snow-inner edu-page">
      <div class="statistics-header">
        <div>
          <div class="statistics-title">运营统计</div>
          <div class="statistics-subtitle">聚合排课、权益和外部同步状态，支持按课程、教师、场地、班级、学生筛选。</div>
        </div>
      </div>

      <s-layout-tools>
        <template #left>
          <a-space wrap>
            <span class="filter-text">日期范围</span>
            <a-range-picker v-model="dateRange" allow-clear style="width: 260px" />
            <span class="filter-text">课程</span>
            <a-select v-model="searchForm.courseId" placeholder="课程" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in courseOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
            </a-select>
            <span class="filter-text">教师</span>
            <a-select v-model="searchForm.teacherId" placeholder="教师" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in teacherOptions" :key="item.id" :value="item.id">{{ teacherLabel(item) }}</a-option>
            </a-select>
            <span class="filter-text">场地</span>
            <a-select v-model="searchForm.roomId" placeholder="场地" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in roomOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
            </a-select>
            <span class="filter-text">班级</span>
            <a-select v-model="searchForm.classId" placeholder="班级" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
            </a-select>
            <span class="filter-text">学生</span>
            <a-select v-model="searchForm.studentId" placeholder="学生" allow-clear allow-search style="width: 160px">
              <a-option v-for="item in studentOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
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
      </s-layout-tools>

      <a-spin :loading="loading" class="statistics-shell">
        <section class="section-block">
          <div class="section-head">
            <div class="section-title">排课统计</div>
            <a-tag color="arcoblue">教师课时 / 场地占用 / 班级课次 / 一对一课次</a-tag>
          </div>
          <div class="metric-grid metric-grid--four">
            <div class="metric-card">
              <div class="metric-card__label">教师课时</div>
              <div class="metric-card__value">{{ teacherLessonTotal }}</div>
              <div class="metric-card__meta">{{ teacherMinuteTotal }} 分钟</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">场地占用</div>
              <div class="metric-card__value">{{ roomLessonTotal }}</div>
              <div class="metric-card__meta">{{ roomMinuteTotal }} 分钟</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">班级课次</div>
              <div class="metric-card__value">{{ classLessonTotal }}</div>
              <div class="metric-card__meta">{{ classMinuteTotal }} 分钟</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">一对一课次</div>
              <div class="metric-card__value">{{ oneToOneLessonTotal }}</div>
              <div class="metric-card__meta">{{ oneToOneMinuteTotal }} 分钟</div>
            </div>
          </div>
          <div class="chart-grid chart-grid--dual">
            <div class="chart-panel">
              <div class="chart-panel__title">教师课时</div>
              <div ref="teacherChartEl" class="chart-view"></div>
            </div>
            <div class="chart-panel">
              <div class="chart-panel__title">场地占用</div>
              <div ref="roomChartEl" class="chart-view"></div>
            </div>
          </div>
          <div class="chart-grid chart-grid--dual">
            <div class="chart-panel">
              <div class="chart-panel__title">班级课次</div>
              <div ref="classChartEl" class="chart-view"></div>
            </div>
            <div class="chart-panel">
              <div class="chart-panel__title">一对一课次</div>
              <div ref="oneToOneChartEl" class="chart-view"></div>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div class="section-title">权益统计</div>
            <a-tag color="green">有效权益 / 即将到期 / 已过期 / 剩余次数异常</a-tag>
          </div>
          <div class="metric-grid metric-grid--four">
            <div class="metric-card">
              <div class="metric-card__label">有效权益</div>
              <div class="metric-card__value">{{ benefitStats.validCount }}</div>
              <div class="metric-card__meta">当前有效</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">即将到期</div>
              <div class="metric-card__value">{{ benefitStats.expiringSoonCount }}</div>
              <div class="metric-card__meta">未来窗口内</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">已过期</div>
              <div class="metric-card__value">{{ benefitStats.expiredCount }}</div>
              <div class="metric-card__meta">需跟进</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">剩余次数异常</div>
              <div class="metric-card__value">{{ benefitStats.zeroRemainingCount }}</div>
              <div class="metric-card__meta">计次权益归零</div>
            </div>
          </div>
          <div class="chart-panel">
            <div class="chart-panel__title">课程权益分布</div>
            <div ref="benefitChartEl" class="chart-view"></div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div class="section-title">外部同步状态</div>
            <a-space wrap>
              <a-tag>待处理</a-tag>
              <a-tag color="green">成功</a-tag>
              <a-tag color="red">失败</a-tag>
              <a-tag color="arcoblue">重试中</a-tag>
              <a-tag color="gray">已取消</a-tag>
            </a-space>
          </div>
          <div class="metric-grid metric-grid--five">
            <div class="metric-card">
              <div class="metric-card__label">待处理</div>
              <div class="metric-card__value">{{ statusCount("pending") }}</div>
              <div class="metric-card__meta">待处理</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">成功</div>
              <div class="metric-card__value">{{ statusCount("success") }}</div>
              <div class="metric-card__meta">成功</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">失败</div>
              <div class="metric-card__value">{{ externalSyncStats.failedCount }}</div>
              <div class="metric-card__meta">失败</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">重试中</div>
              <div class="metric-card__value">{{ externalSyncStats.retryingCount }}</div>
              <div class="metric-card__meta">重试中</div>
            </div>
            <div class="metric-card">
              <div class="metric-card__label">已取消</div>
              <div class="metric-card__value">{{ statusCount("canceled") }}</div>
              <div class="metric-card__meta">已取消</div>
            </div>
          </div>
          <div class="chart-panel">
            <div class="chart-panel__title">同步状态分布</div>
            <div ref="syncChartEl" class="chart-view"></div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div class="section-title">权益异常课次</div>
            <a-tag color="orange">{{ scheduleStats.eligibilityDetails.length }} 条</a-tag>
          </div>
          <a-table
            row-key="lessonId"
            :data="eligibilityRows"
            :pagination="false"
            :bordered="{ cell: true }"
            :scroll="{ x: '100%', minWidth: 1120 }"
          >
            <template #columns>
              <a-table-column title="课次ID" data-index="lessonId" :width="90" />
              <a-table-column title="学生" :width="150">
                <template #cell="{ record }">{{ studentName(record.studentId) }}</template>
              </a-table-column>
              <a-table-column title="课程" :width="150">
                <template #cell="{ record }">{{ courseName(record.courseId) }}</template>
              </a-table-column>
              <a-table-column title="班级" :width="150">
                <template #cell="{ record }">{{ className(record.classId) }}</template>
              </a-table-column>
              <a-table-column title="权益状态" data-index="eligibilityStatus" :width="110" />
              <a-table-column title="原因" data-index="reasonCode" :width="180" ellipsis tooltip />
              <a-table-column title="检查时间" data-index="checkedAt" :width="180" />
            </template>
          </a-table>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div class="section-title">冲突覆盖记录</div>
            <a-tag color="red">{{ scheduleStats.conflictDetails.length }} 条</a-tag>
          </div>
          <a-table
            row-key="lessonId"
            :data="conflictRows"
            :pagination="false"
            :bordered="{ cell: true }"
            :scroll="{ x: '100%', minWidth: 1120 }"
          >
            <template #columns>
              <a-table-column title="课次ID" data-index="lessonId" :width="90" />
              <a-table-column title="规则ID" data-index="ruleId" :width="90" />
              <a-table-column title="冲突类型" data-index="conflictType" :width="120" />
              <a-table-column title="冲突键" data-index="conflictKey" :width="160" ellipsis tooltip />
              <a-table-column title="说明" data-index="reason" :width="220" ellipsis tooltip />
              <a-table-column title="操作人" data-index="operatorId" :width="90" />
              <a-table-column title="发生时间" data-index="occurredAt" :width="180" />
            </template>
          </a-table>
        </section>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import VChart from "@visactor/vchart";
import { Message } from "@arco-design/web-vue";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import {
  getEduBenefitStatisticsAPI,
  getEduClassListAPI,
  getEduClassTeacherOptionsAPI,
  getEduCourseOptionsAPI,
  getEduExternalSyncStatisticsAPI,
  getEduRoomOptionsAPI,
  getEduScheduleStatisticsAPI,
  getEduStudentListAPI,
  type EduBenefitStatisticsData,
  type EduClassItem,
  type EduExternalSyncStatisticsData,
  type EduScheduleStatisticsData,
  type EduStatisticsFilterParams,
  type EduTeacherOptionItem,
} from "@/api/edu";

type StatisticsSearchForm = Omit<EduStatisticsFilterParams, "startDate" | "endDate">;
type ChartValueRow = { name: string; value: number };

const loading = ref(false);
const dateRange = ref<(string | Date)[] | undefined>();
const searchForm = reactive<StatisticsSearchForm>({
  courseId: undefined,
  teacherId: undefined,
  roomId: undefined,
  classId: undefined,
  studentId: undefined,
});

const courseOptions = ref<{ id: number; name: string }[]>([]);
const teacherOptions = ref<EduTeacherOptionItem[]>([]);
const roomOptions = ref<{ id: number; name: string }[]>([]);
const classOptions = ref<EduClassItem[]>([]);
const studentOptions = ref<{ id: number; name: string }[]>([]);

const scheduleStats = ref<EduScheduleStatisticsData>({
  teacherLessons: [],
  roomUsages: [],
  classLessons: [],
  oneToOneLessons: [],
  eligibilityDetails: [],
  conflictOverrides: [],
  conflictDetails: [],
});
const benefitStats = ref<EduBenefitStatisticsData>({
  validCount: 0,
  expiringSoonCount: 0,
  expiredCount: 0,
  zeroRemainingCount: 0,
  courseBenefitCounts: [],
});
const externalSyncStats = ref<EduExternalSyncStatisticsData>({
  statusCounts: [],
  failedCount: 0,
  retryingCount: 0,
  dueRetryCount: 0,
});

const teacherChartEl = ref<HTMLElement>();
const roomChartEl = ref<HTMLElement>();
const classChartEl = ref<HTMLElement>();
const oneToOneChartEl = ref<HTMLElement>();
const benefitChartEl = ref<HTMLElement>();
const syncChartEl = ref<HTMLElement>();

let teacherChart: VChart | null = null;
let roomChart: VChart | null = null;
let classChart: VChart | null = null;
let oneToOneChart: VChart | null = null;
let benefitChart: VChart | null = null;
let syncChart: VChart | null = null;

const teacherLabel = (item: EduTeacherOptionItem) => item.name || item.nickName || item.username || `教师#${item.id}`;
const courseName = (id?: number) => courseOptions.value.find((item) => item.id === id)?.name ?? "-";
const className = (id?: number) => classOptions.value.find((item) => item.id === id)?.name ?? "-";
const studentName = (id?: number) => studentOptions.value.find((item) => item.id === id)?.name ?? "-";
const roomName = (id?: number) => roomOptions.value.find((item) => item.id === id)?.name ?? "-";
const teacherName = (id?: number) => {
  const teacher = teacherOptions.value.find((item) => item.id === id);
  return teacher ? teacherLabel(teacher) : "-";
};

const sumBy = <T>(rows: T[], selector: (row: T) => number) => rows.reduce((total, row) => total + selector(row), 0);

const teacherLessonTotal = computed(() => sumBy(scheduleStats.value.teacherLessons, (item) => item.lessonCount));
const teacherMinuteTotal = computed(() => sumBy(scheduleStats.value.teacherLessons, (item) => item.totalMinutes));
const roomLessonTotal = computed(() => sumBy(scheduleStats.value.roomUsages, (item) => item.lessonCount));
const roomMinuteTotal = computed(() => sumBy(scheduleStats.value.roomUsages, (item) => item.totalMinutes));
const classLessonTotal = computed(() => sumBy(scheduleStats.value.classLessons, (item) => item.lessonCount));
const classMinuteTotal = computed(() => sumBy(scheduleStats.value.classLessons, (item) => item.totalMinutes));
const oneToOneLessonTotal = computed(() => sumBy(scheduleStats.value.oneToOneLessons, (item) => item.lessonCount));
const oneToOneMinuteTotal = computed(() => sumBy(scheduleStats.value.oneToOneLessons, (item) => item.totalMinutes));

const eligibilityRows = computed(() => scheduleStats.value.eligibilityDetails);
const conflictRows = computed(() => scheduleStats.value.conflictDetails);

const statusCount = (status: string) => externalSyncStats.value.statusCounts.find((item) => item.status === status)?.count ?? 0;

const normalizeDateValue = (value?: string | Date) => {
  if (!value) return undefined;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const currentParams = (): EduStatisticsFilterParams => ({
  startDate: normalizeDateValue(dateRange.value?.[0]),
  endDate: normalizeDateValue(dateRange.value?.[1]),
  courseId: searchForm.courseId,
  teacherId: searchForm.teacherId,
  roomId: searchForm.roomId,
  classId: searchForm.classId,
  studentId: searchForm.studentId,
});

const buildBarSpec = (title: string, rows: ChartValueRow[]) => ({
  type: "bar",
  data: [
    {
      id: `${title}-data`,
      values: rows.length ? rows : [{ name: "暂无数据", value: 0 }],
    },
  ],
  xField: "name",
  yField: "value",
  padding: { left: 48, right: 24, top: 36, bottom: 42 },
  title: { visible: false, text: title },
  barMaxWidth: 34,
  axes: [
    { orient: "bottom", label: { autoRotate: true } },
    { orient: "left" },
  ],
  tooltip: {
    visible: true,
  },
});

const buildPieSpec = (rows: ChartValueRow[]) => ({
  type: "pie",
  data: [
    {
      id: "pie-data",
      values: rows.length ? rows : [{ name: "暂无数据", value: 0 }],
    },
  ],
  outerRadius: 0.82,
  innerRadius: 0.52,
  valueField: "value",
  categoryField: "name",
  legends: { visible: true, orient: "bottom" },
  label: { visible: true },
  tooltip: {
    mark: {
      content: [
        { key: (datum: any) => datum.name, value: (datum: any) => String(datum.value) },
      ],
    },
  },
});

const renderChart = (container: HTMLElement | undefined, chartRef: VChart | null, spec: Record<string, unknown>) => {
  if (!container) return null;
  chartRef?.release();
  const chart = new VChart(spec as any, { dom: container });
  chart.renderSync();
  return chart;
};

const renderCharts = () => {
  teacherChart = renderChart(
    teacherChartEl.value,
    teacherChart,
    buildBarSpec(
      "教师课时",
      scheduleStats.value.teacherLessons.map((item) => ({
        name: teacherName(item.teacherId),
        value: item.totalMinutes,
      }))
    )
  );
  roomChart = renderChart(
    roomChartEl.value,
    roomChart,
    buildBarSpec(
      "场地占用",
      scheduleStats.value.roomUsages.map((item) => ({
        name: roomName(item.roomId),
        value: item.totalMinutes,
      }))
    )
  );
  classChart = renderChart(
    classChartEl.value,
    classChart,
    buildBarSpec(
      "班级课次",
      scheduleStats.value.classLessons.map((item) => ({
        name: className(item.classId),
        value: item.lessonCount,
      }))
    )
  );
  oneToOneChart = renderChart(
    oneToOneChartEl.value,
    oneToOneChart,
    buildBarSpec(
      "一对一课次",
      scheduleStats.value.oneToOneLessons.map((item) => ({
        name: studentName(item.studentId),
        value: item.lessonCount,
      }))
    )
  );
  benefitChart = renderChart(
    benefitChartEl.value,
    benefitChart,
    buildPieSpec(
      benefitStats.value.courseBenefitCounts.map((item) => ({
        name: courseName(item.courseId),
        value: item.benefitCount,
      }))
    )
  );
  syncChart = renderChart(
    syncChartEl.value,
    syncChart,
    buildPieSpec(
      externalSyncStats.value.statusCounts.map((item) => ({
        name: item.status,
        value: item.count,
      }))
    )
  );
};

const fetchOptions = async () => {
  const [courses, teachers, rooms, classes, students] = await Promise.all([
    getEduCourseOptionsAPI(),
    getEduClassTeacherOptionsAPI(),
    getEduRoomOptionsAPI(),
    getEduClassListAPI({ pageNum: 1, pageSize: 500 }),
    getEduStudentListAPI({ pageNum: 1, pageSize: 500 }),
  ]);
  courseOptions.value = courses.data.list || [];
  teacherOptions.value = teachers.data.list || [];
  roomOptions.value = rooms.data.list || [];
  classOptions.value = classes.data.list || [];
  studentOptions.value = students.data.list || [];
};

const fetchStatistics = async () => {
  loading.value = true;
  try {
    const params = currentParams();
    const [scheduleRes, benefitRes, syncRes] = await Promise.all([
      getEduScheduleStatisticsAPI(params),
      getEduBenefitStatisticsAPI(params),
      getEduExternalSyncStatisticsAPI(params),
    ]);
    scheduleStats.value = scheduleRes.data;
    benefitStats.value = benefitRes.data;
    externalSyncStats.value = syncRes.data;
    await nextTick();
    renderCharts();
  } catch (error) {
    console.error(error);
    Message.error("加载运营统计失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  await fetchStatistics();
};

const handleReset = async () => {
  dateRange.value = undefined;
  Object.assign(searchForm, {
    courseId: undefined,
    teacherId: undefined,
    roomId: undefined,
    classId: undefined,
    studentId: undefined,
  });
  await fetchStatistics();
};

onMounted(async () => {
  await fetchOptions();
  await fetchStatistics();
});

onBeforeUnmount(() => {
  teacherChart?.release();
  roomChart?.release();
  classChart?.release();
  oneToOneChart?.release();
  benefitChart?.release();
  syncChart?.release();
});
</script>

<style scoped>
.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.statistics-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-1);
}

.statistics-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-3);
}

.statistics-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-text {
  font-size: 12px;
  color: var(--color-text-3);
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
}

.metric-grid {
  display: grid;
  gap: 12px;
}

.metric-grid--four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-grid--five {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.metric-card {
  min-height: 120px;
  padding: 16px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: var(--color-bg-2);
}

.metric-card__label {
  font-size: 12px;
  color: var(--color-text-3);
}

.metric-card__value {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  color: var(--color-text-1);
}

.metric-card__meta {
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-text-3);
}

.chart-grid {
  display: grid;
  gap: 12px;
}

.chart-grid--dual {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chart-panel {
  min-height: 320px;
  padding: 14px;
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  background: var(--color-bg-2);
}

.chart-panel__title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}

.chart-view {
  width: 100%;
  min-height: 280px;
}

@media (max-width: 1200px) {
  .metric-grid--four,
  .metric-grid--five,
  .chart-grid--dual {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .metric-grid--four,
  .metric-grid--five,
  .chart-grid--dual {
    grid-template-columns: 1fr;
  }
}
</style>
