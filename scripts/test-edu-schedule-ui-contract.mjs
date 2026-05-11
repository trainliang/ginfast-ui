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
  "src/api/edu/schedule.ts",
  "src/views/edu/components/options.ts",
  "src/views/edu/schedule/schedule.vue",
].forEach(mustExist);

includes("src/api/edu.ts", 'export * from "./edu/schedule";');

[
  "getEduScheduleRuleListAPI",
  "addEduScheduleRuleAPI",
  "editEduScheduleRuleAPI",
  "deleteEduScheduleRuleAPI",
  "previewEduScheduleRuleChangeAPI",
  "getEduLessonListAPI",
  "getEduLessonCalendarAPI",
  "checkEduScheduleConflictsAPI",
  "rescheduleEduLessonAPI",
  "stopEduLessonAPI",
  "cancelEduLessonAPI",
  "restoreEduLessonAPI",
  "makeupEduLessonAPI",
  "getEduLessonChangeLogsAPI",
  "edu/schedule-rules/list",
  "edu/schedule-rules/add",
  "edu/schedule-rules/edit",
  "edu/schedule-rules/delete",
  "edu/schedule-rules/preview-change",
  "edu/lessons/list",
  "edu/lessons/calendar",
  "edu/lessons/reschedule",
  "edu/lessons/stop",
  "edu/lessons/cancel",
  "edu/lessons/restore",
  "edu/lessons/makeup",
  "change-logs",
  "edu/schedules/check-conflicts",
].forEach((text) => includes("src/api/edu/schedule.ts", text));

[
  "scheduleRuleTypeOptions",
  "scheduleRepeatTypeOptions",
  "lessonStatusOptions",
  "weekdayOptions",
].forEach((text) => includes("src/views/edu/components/options.ts", `export const ${text}`));

[
  "排课规则",
  "课次列表",
  "课表日历",
  "保存前冲突校验",
  "变更预览",
  "规则类型",
  "重复方式",
  "课次状态",
  "日视图",
  "周视图",
  "月视图",
  "课次详情",
  "调课",
  "停课",
  "取消",
  "恢复",
  "补课",
  "变更历史",
  "教师",
  "场地",
  "班级",
  "学生",
].forEach((text) => includes("src/views/edu/schedule/schedule.vue", text));

console.log("contract ok");
