import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (path) => readFileSync(resolve(root, path), "utf8");
const mustExist = (path) => {
  assert.ok(existsSync(resolve(root, path)), `missing file: ${path}`);
};
const includes = (path, text) => {
  const content = read(path);
  assert.ok(content.includes(text), `${path} missing text: ${text}`);
};

[
  "src/api/edu.ts",
  "src/api/edu/statistics.ts",
  "src/views/edu/statistics/statistics.vue",
].forEach(mustExist);

includes("src/api/edu.ts", 'export * from "./edu/statistics";');

[
  "getEduScheduleStatisticsAPI",
  "getEduBenefitStatisticsAPI",
  "getEduExternalSyncStatisticsAPI",
  "edu/statistics/schedule",
  "edu/statistics/benefits",
  "edu/statistics/external-sync",
].forEach((text) => includes("src/api/edu/statistics.ts", text));

[
  "运营统计",
  "日期范围",
  "课程",
  "教师",
  "场地",
  "班级",
  "学生",
  "排课统计",
  "权益统计",
  "外部同步状态",
  "教师课时",
  "场地占用",
  "班级课次",
  "一对一课次",
  "有效权益",
  "即将到期",
  "已过期",
  "剩余次数异常",
  "待处理",
  "成功",
  "失败",
  "重试中",
  "已取消",
  "权益异常课次",
  "冲突覆盖记录",
  "VChart",
].forEach((text) => includes("src/views/edu/statistics/statistics.vue", text));

console.log("contract ok");
