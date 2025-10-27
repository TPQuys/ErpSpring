let messageApi = null;
let notificationApi = null;
let modalApi = null;

export const setNotifyInstance = (app) => {
  messageApi = app.message;
  notificationApi = app.notification;
  modalApi = app.modal;
};

const ensureInitialized = () => {
  if (!messageApi || !notificationApi) {
    console.warn(
      '[notify] Cảnh báo: Bạn đang gọi notify trước khi setNotifyInstance(app).'
    );
    return false;
  }
  return true;
};

export const notify = {
  success: (title, desc) => {
    if (!ensureInitialized()) return;
    notificationApi.success({
      message: title,
      description: desc,
    });
  },
  error: (title, desc) => {
    if (!ensureInitialized()) return;
    notificationApi.error({
      message: title,
      description: desc,
    });
  },
  info: (title, desc) => {
    if (!ensureInitialized()) return;
    notificationApi.info({
      message: title,
      description: desc,
    });
  },
  warning: (title, desc) => {
    if (!ensureInitialized()) return;
    notificationApi.warning({
      message: title,
      description: desc,
    });
  },

  message: {
    success: (text) => ensureInitialized() && messageApi.success(text),
    error: (text) => ensureInitialized() && messageApi.error(text),
    info: (text) => ensureInitialized() && messageApi.info(text),
    warning: (text) => ensureInitialized() && messageApi.warning(text),
    loading: (text) => ensureInitialized() && messageApi.loading(text),
  },

  modal: {
    confirm: (options) => ensureInitialized() && modalApi.confirm(options),
    info: (options) => ensureInitialized() && modalApi.info(options),
    warning: (options) => ensureInitialized() && modalApi.warning(options),
    error: (options) => ensureInitialized() && modalApi.error(options),
    success: (options) => ensureInitialized() && modalApi.success(options),
  },
};
