'use strict';

const R = require('../../utils/R');

const error = {
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
  codeNotExisted: {
    code: 400004,
    message: '验证码不存在，请检查您的输入',
  },
  codeNotRight: {
    code: 400005,
    message: '验证码不正确，请重试',
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
  unknownError: {
    code: 500000,
    message: '未知错误',
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
