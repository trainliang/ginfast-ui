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

const pagePath = "src/views/edu/lesson-completion/rules.vue";
mustExist(pagePath);

includes(pagePath, "刷新");
includes(pagePath, "<icon-refresh");
includes(pagePath, "@click=\"fetchRules\"");
includes(pagePath, "Message.success(\"消课规则已保存\")");
includes(pagePath, "await fetchRules();");

const content = read(pagePath);
const successIndex = content.indexOf("Message.success(\"消课规则已保存\")");
const fetchIndex = content.indexOf("await fetchRules();");

assert.ok(fetchIndex >= 0, "rules.vue missing await fetchRules()");
assert.ok(successIndex >= 0, "rules.vue missing success message");
assert.ok(fetchIndex < successIndex, "rules.vue should refresh rules before showing save success");
assert.ok(!content.includes("rules.value = nextRules;"), "rules.vue should not rely on optimistic local overwrite after save");

console.log("contract ok");
