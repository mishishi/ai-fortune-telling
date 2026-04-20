import { useState } from 'react';

interface ValidationRule {
  field: string;
  rules: Array<{
    test: (value: any, context?: Record<string, any>) => boolean;
    message: string;
  }>;
}

export function useFormValidation(rules: ValidationRule[]) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (field: string, value: any, context?: Record<string, any>): boolean => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return true;

    for (const r of rule.rules) {
      if (!r.test(value, context)) {
        setErrors(prev => ({ ...prev, [field]: r.message }));
        return false;
      }
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return true;
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateAll = (data: Record<string, any>): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const rule of rules) {
      const value = data[rule.field];
      for (const r of rule.rules) {
        if (!r.test(value, data)) {
          newErrors[rule.field] = r.message;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  return { errors, validate, clearError, validateAll };
}
