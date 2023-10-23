import xxCfg from "./model/xxCfg.js";

/**
 *  支持锅巴配置
 */
export function supportGuoba() {
  return {
    pluginInfo: {
      name: "geetest-plugin",
      title: "geetest-plugin",
      author: "@Simplxs",
      authorLink: "https://github.com/Simplxss",
      link: "https://github.com/Simplxss/geetest-plugin",
      isV3: true,
      isV2: false,
      description: "提供接入验证码识别功能",
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: "mdi:stove",
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: "#d19f56",
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          field: "autoAddress",
          label: "自动过验证码API",
          bottomHelpMessage: "http://api.example.com/geetest?gt={0}&challenge={1}",
          component: "Input",
          componentProps: {
            placeholder: "请输入自动过验证码API",
          },
        },
        {
          field: "manualAddress",
          label: "手动过验证码API",
          bottomHelpMessage: "http://api.example.com/geetest?gt={0}&challenge={1}",
          component: "Input",
          componentProps: {
            placeholder: "请输入手动过验证码API",
          },
        },
        {
          field: "blackList",
          label: "黑名单QQ",
          bottomHelpMessage: "黑名单QQ，可以设置多个，用英文逗号分隔",
          component: "GTags",
          componentProps: {
            placeholder: '请输入黑名单QQ',
            allowAdd: true,
            allowDel: true,
            showPrompt: true,
            promptProps: {
              content: '请输入QQ号：',
              placeholder: '请输入QQ号',
              okText: '添加',
              rules: [
                { required: true, message: 'QQ号得填上才行哦~' },
                { pattern: '^\\d+$', message: 'QQ号应该是纯数字的吧' },
                { min: 5, message: '真的有这么短的QQ号吗？' },
                { max: 10, message: '太…太长了……' },
              ],
            },
            valueFormatter: ((value) => Number.parseInt(value)).toString(),
          }
        }
      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData() {
        return xxCfg.getYaml("config");
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData(data, { Result }) {
        xxCfg.saveYaml("config", data)
        return Result.ok({}, "保存成功~");
      },
    },
  };
}
