'use strict';

module.exports = {
  "host": "https://oapi.dingtalk.com",
  "corpid": process.env.NODE_DINGTALK_TEST_CORPID || "ding88426d4c2c14a8d6",
  "corpsecret": process.env.NODE_DINGTALK_TEST_CORPSECRET || "FfvjRyDkFGsKF3_qSNcvJvOFHdvdgdiYgRToEgUjnyS93vYec8hPk0vEY3zg_ZVY",
  "agentid": process.env.NODE_DINGTALK_TEST_AGENTID || "36504082",
  "appid": process.env.NODE_DINGTALK_TEST_APPID || 'dingoaurmvf8k9zzjnvjzw',
  "appsecret": process.env.NODE_DINGTALK_TEST_APPSECRET || 'WWYa5EHqaMEDwzfjeidC5nsQnFn2gBJcRD20J3bKQ3in5Eap6-DLFzPxb7dahfLb',
  "requestOpts": {
    "timeout": 10000
  }
};
