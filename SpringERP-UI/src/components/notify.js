// src/utils/notify.js
let messageApi = null;
let notificationApi = null;

export const setNotifyInstance = (app) => {
  messageApi = app.message;
  notificationApi = app.notification;
};

// Gói sẵn các hàm tiện gọi
export const notify = {
  success: (title, desc) =>
    notificationApi?.success({
      message: title,
      description: desc,
    }),
  error: (title, desc) =>
    notificationApi?.error({
      message: title,
      description: desc,
    }),
  info: (title, desc) =>
    notificationApi?.info({
      message: title,
      description: desc,
    }),
  warning: (title, desc) =>
    notificationApi?.warning({
      message: title,
      description: desc,
    }),
  message: {
    success: (text) => messageApi?.success(text),
    error: (text) => messageApi?.error(text),
    info: (text) => messageApi?.info(text),
    warning: (text) => messageApi?.warning(text),
    loading: (text) => messageApi?.loading(text),
  },
};
