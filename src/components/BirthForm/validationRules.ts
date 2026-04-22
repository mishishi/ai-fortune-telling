export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export const validationRules = [
  {
    field: 'name',
    rules: [
      { test: (v: any) => typeof v === 'string' && v.trim().length > 0, message: '请输入姓名' },
      { test: (v: any) => typeof v === 'string' && v.trim().length >= 2, message: '姓名至少需要2个字符' },
    ],
  },
  {
    field: 'date',
    rules: [
      { test: (_: any, form: any) => isValidDate(form.year, form.month, form.day), message: '请输入有效的出生日期' },
    ],
  },
  {
    field: 'province',
    rules: [
      { test: (v: any) => !!v, message: '请选择出生省份' },
    ],
  },
];
