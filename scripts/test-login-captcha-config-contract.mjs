import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const read = (path) => readFileSync(resolve(root, path), "utf8");
const readServer = (path) => {
  const serverRoot = process.env.GINFAST_SERVER_DIR || "../ginfast-server";
  return readFileSync(resolve(root, serverRoot, path), "utf8");
};

const loginForm = read("src/views/login/components/login-form.vue");
const userApi = read("src/api/user.ts");
const authController = readServer("app/controllers/auth.go");

assert.ok(userApi.includes("enabled: boolean"), "captcha API type must expose whether captcha is enabled");

assert.ok(
  /"enabled":\s*false/.test(authController),
  "captcha endpoint must explicitly return enabled=false when captcha is closed"
);

assert.ok(/"enabled":\s*true/.test(authController), "captcha endpoint must explicitly return enabled=true when captcha is open");

assert.ok(!loginForm.includes("captchaConfig"), "login form must not read system captcha config directly");

assert.ok(loginForm.includes("showCaptcha"), "login form must derive captcha visibility from the captcha endpoint response");

assert.ok(
  /<a-form-item\s+v-if="showCaptcha"\s+field="captchaValue"/.test(loginForm),
  "captcha form item must only render when captcha endpoint says it is enabled"
);

assert.ok(
  /captchaValue:\s*showCaptcha\.value\s*\?/.test(loginForm),
  "captcha validation rules must only require captcha when captcha endpoint says it is enabled"
);

assert.ok(
  /showCaptcha\.value\s*=\s*res\.data\.enabled/.test(loginForm),
  "refreshCaptcha must update visibility from captcha endpoint response"
);

console.log("login captcha config contract ok");
