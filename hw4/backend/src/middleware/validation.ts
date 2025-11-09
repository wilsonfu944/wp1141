// 輸入驗證中介軟體
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// 註冊驗證規則
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子郵件地址',
    'any.required': '電子郵件為必填欄位'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密碼至少需要 6 個字元',
    'any.required': '密碼為必填欄位'
  })
});

// 登入驗證規則
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子郵件地址',
    'any.required': '電子郵件為必填欄位'
  }),
  password: Joi.string().required().messages({
    'any.required': '密碼為必填欄位'
  })
});

// 路線建立驗證規則
const createRouteSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    'string.min': '路線標題不能為空',
    'string.max': '路線標題不能超過 100 個字元',
    'any.required': '路線標題為必填欄位'
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': '路線描述不能超過 500 個字元'
  }),
  startLat: Joi.number().min(-90).max(90).required().messages({
    'number.min': '起始緯度必須在 -90 到 90 之間',
    'number.max': '起始緯度必須在 -90 到 90 之間',
    'any.required': '起始緯度為必填欄位'
  }),
  startLng: Joi.number().min(-180).max(180).required().messages({
    'number.min': '起始經度必須在 -180 到 180 之間',
    'number.max': '起始經度必須在 -180 到 180 之間',
    'any.required': '起始經度為必填欄位'
  }),
  endLat: Joi.number().min(-90).max(90).required().messages({
    'number.min': '終點緯度必須在 -90 到 90 之間',
    'number.max': '終點緯度必須在 -90 到 90 之間',
    'any.required': '終點緯度為必填欄位'
  }),
  endLng: Joi.number().min(-180).max(180).required().messages({
    'number.min': '終點經度必須在 -180 到 180 之間',
    'number.max': '終點經度必須在 -180 到 180 之間',
    'any.required': '終點經度為必填欄位'
  }),
  date: Joi.string().isoDate().required().messages({
    'string.isoDate': '請輸入有效的日期格式 (ISO 8601)',
    'any.required': '日期為必填欄位'
  })
});

// 路線更新驗證規則
const updateRouteSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional().messages({
    'string.min': '路線標題不能為空',
    'string.max': '路線標題不能超過 100 個字元'
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': '路線描述不能超過 500 個字元'
  }),
  startLat: Joi.number().min(-90).max(90).optional().messages({
    'number.min': '起始緯度必須在 -90 到 90 之間',
    'number.max': '起始緯度必須在 -90 到 90 之間'
  }),
  startLng: Joi.number().min(-180).max(180).optional().messages({
    'number.min': '起始經度必須在 -180 到 180 之間',
    'number.max': '起始經度必須在 -180 到 180 之間'
  }),
  endLat: Joi.number().min(-90).max(90).optional().messages({
    'number.min': '終點緯度必須在 -90 到 90 之間',
    'number.max': '終點緯度必須在 -90 到 90 之間'
  }),
  endLng: Joi.number().min(-180).max(180).optional().messages({
    'number.min': '終點經度必須在 -180 到 180 之間',
    'number.max': '終點經度必須在 -180 到 180 之間'
  }),
  date: Joi.string().isoDate().optional().messages({
    'string.isoDate': '請輸入有效的日期格式 (ISO 8601)'
  })
});

// 驗證中介軟體工廠函數
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(422).json({
        success: false,
        error: '輸入驗證失敗',
        details: errorMessages
      });
    }
    
    // 將驗證後的資料替換原始資料
    req.body = value;
    next();
  };
};

// 匯出驗證中介軟體
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateCreateRoute = validate(createRouteSchema);
export const validateUpdateRoute = validate(updateRouteSchema);





