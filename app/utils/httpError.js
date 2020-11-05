'use strict';

const R = require('../../utils/R');

const error = {
  inputError: {
    code: 100000,
    message: '输入的内容有误',
  },
  authFalied: {
    code: 400001,
    message: '用户名或密码错误',
  },
  confirmNotRight: {
    code: 400002,
    message: '两次输入的密码不一致',
  },
  cannotSendMail: {
    code: 400003,
    message: '现在还不能发送，请稍后再试',
  },
  mailCodeNotExisted: {
    code: 400004,
    message: '邮件验证码不存在，请检查您的输入',
  },
  mailCodeNotRight: {
    code: 400005,
    message: '邮件验证码不正确，请重试',
  },
  usernameExisted: {
    code: 400006,
    message: '用户名已存在',
  },
  userCredentialError: {
    code: 400008,
    message: '用户名或密码错误',
  },
  captchaRequired: {
    code: 400009,
    message: '请提供验证码以继续执行操作',
  },
  captchaVerifyFailed: {
    code: 400010,
    message: '验证码不正确',
  },
  updateDataFailed: {
    code: 400011,
    message: '数据更新失败',
  },
  tokenInvalid: {
    code: 400012,
    message: 'token无效',
  },
  unknownError: {
    code: 500000,
    message: '未知错误',
  },
  requestParamError: {
    code: 500001,
    message: '请求参数有误',
  },
};

const httpError = (ctx, err, detail) => {
  const { code, message } = error[err];
  return R.error(ctx, message, detail || null, code);
};

module.exports = {
  httpErrorConst: error,
  httpError,
};
