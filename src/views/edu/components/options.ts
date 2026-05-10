import type { DictItem } from "@/api/dictionary";

export const statusOptions = [
  { label: "启用", value: 1 },
  { label: "停用", value: 0 },
];

export const studentStatusOptions = [
  { label: "在读", value: 1 },
  { label: "暂停", value: 0 },
  { label: "退学", value: 2 },
];

export const genderOptions = [
  { label: "未知", value: "unknown" },
  { label: "男", value: "male" },
  { label: "女", value: "female" },
];

export const courseTypeOptions = [
  { label: "托管", value: "daycare" },
  { label: "艺术", value: "art" },
  { label: "体育", value: "sport" },
  { label: "其他", value: "other" },
];

export const classTypeOptions = [
  { label: "托管班", value: "daycare" },
  { label: "班课", value: "group" },
];

export const memberStatusOptions = [
  { label: "在读", value: "studying" },
  { label: "暂停", value: "paused" },
  { label: "退班", value: "left" },
];

export const roomTypeOptions = [
  { label: "教室", value: "classroom" },
  { label: "托管室", value: "daycare_room" },
  { label: "球场", value: "court" },
  { label: "舞蹈室", value: "dance_room" },
  { label: "其他", value: "other" },
];

export const roomExceptionTypeOptions = [
  { label: "特殊开放", value: "open" },
  { label: "停用", value: "closed" },
];

export const weekdayOptions = [
  { label: "周一", value: 1 },
  { label: "周二", value: 2 },
  { label: "周三", value: 3 },
  { label: "周四", value: 4 },
  { label: "周五", value: 5 },
  { label: "周六", value: 6 },
  { label: "周日", value: 7 },
];

export const labelOf = (options: Array<{ label: string; value: string | number }>, value?: string | number) => {
  return options.find((item) => item.value === value)?.label ?? "-";
};

export const dictItemsToOptions = (items: DictItem[] = [], numeric = false) => {
  return items.map((item) => ({
    label: item.name,
    value: numeric ? Number(item.value) : item.value,
  }));
};
