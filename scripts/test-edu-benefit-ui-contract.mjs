import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
  "src/api/edu/term.ts",
  "src/api/edu/benefit.ts",
  "src/views/edu/term/term.vue",
  "src/views/edu/benefit/product.vue",
  "src/views/edu/benefit/student-benefit.vue",
].forEach(mustExist);

includes("src/api/edu.ts", 'export * from "./edu/term";');
includes("src/api/edu.ts", 'export * from "./edu/benefit";');

[
  "teachingModeOptions",
  "requiresRoomOptions",
  "benefitCheckPolicyOptions",
  "benefitTypeOptions",
  "calculationModeOptions",
  "benefitStatusOptions",
  "externalSyncStatusOptions",
].forEach((name) => includes("src/views/edu/components/options.ts", `export const ${name}`));

["计次", "时长", "无额度"].forEach((text) => includes("src/views/edu/components/options.ts", text));

[
  'getEduTermListAPI',
  'addEduTermAPI',
  'editEduTermAPI',
  'deleteEduTermAPI',
  'getEduTermClosedDaysAPI',
  'saveEduTermClosedDaysAPI',
  'edu/terms/list',
  'edu/terms/add',
  'edu/terms/edit',
  'edu/terms/delete',
  'edu/terms/',
  '/closed-days',
  '/closed-days/save',
].forEach((text) => includes("src/api/edu/term.ts", text));

[
  'getEduBenefitProductListAPI',
  'addEduBenefitProductAPI',
  'editEduBenefitProductAPI',
  'deleteEduBenefitProductAPI',
  'getEduStudentBenefitListAPI',
  'addEduStudentBenefitAPI',
  'editEduStudentBenefitAPI',
  'checkEduStudentBenefitAPI',
  'repairEduStudentBenefitScheduleAPI',
  'getEduBenefitLedgerListAPI',
  'getEduBenefitExternalSyncListAPI',
  'retryEduBenefitExternalSyncAPI',
  'edu/benefit-products/list',
  'edu/student-benefits/list',
  'edu/student-benefits/check',
  'edu/student-benefits/repair-schedule',
  'edu/benefit-ledgers/list',
  'edu/benefit-external-sync/list',
  'edu/benefit-external-sync/retry',
].forEach((text) => includes("src/api/edu/benefit.ts", text));

[
  "defaultTeachingMode",
  "requiresRoom",
  "teachingModeOptions",
  "课程/项目",
  "默认授课方式",
  "是否需要场地",
].forEach((text) => includes("src/views/edu/course/course.vue", text));

[
  "benefitCheckPolicy",
  "benefitCheckPolicyOptions",
  "权益校验策略",
].forEach((text) => includes("src/views/edu/class/class.vue", text));

[
  "学期名称",
  "停课日",
  "closed-days",
  "保存停课日",
].forEach((text) => includes("src/views/edu/term/term.vue", text));

[
  "权益产品",
  "课程适用范围",
  "新增权益产品",
].forEach((text) => includes("src/views/edu/benefit/product.vue", text));

[
  "学生权益",
  "权益校验",
  "续费修复",
  "外部同步",
  "新增学生权益",
  "getEduStudentListAPI",
  "getEduCourseOptionsAPI",
  "getEduBenefitProductOptionsAPI",
  "studentOptions",
  "courseOptions",
  "productOptions",
  "选择学生",
  "选择课程",
  "选择产品",
].forEach((text) => includes("src/views/edu/benefit/student-benefit.vue", text));

console.log("contract ok");
