
import { useState } from 'react';

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (name) {
      case 'patient_name':
        if (!value.trim()) errors[name] = 'お名前は必須です';
        break;
      case 'age':
        if (!value.trim()) {
          errors[name] = '年齢は必須です';
        } else {
          const ageNum = Number(value.trim());
          if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
            errors[name] = '有効な年齢を入力してください';
          }
        }
        break;
      case 'phone':
        if (!value.trim()) errors[name] = '電話番号は必須です';
        else if (!/^[\d\-\(\)\+\s]+$/.test(value)) {
          errors[name] = '有効な電話番号を入力してください';
        }
        break;
      case 'email':
        if (!value.trim()) errors[name] = 'メールアドレスは必須です';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors[name] = '有効なメールアドレスを入力してください';
        }
        break;
      case 'password':
        if (value && value.length < 8) {
          errors[name] = 'パスワードは8文字以上で入力してください';
        }
        break;
    }
    
    // エラーがない場合は該当フィールドのエラーを削除
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (Object.keys(errors).length === 0) {
        delete newErrors[name];
      } else {
        Object.assign(newErrors, errors);
      }
      return newErrors;
    });
  };

  return {
    validationErrors,
    validateField,
    setValidationErrors
  };
};
