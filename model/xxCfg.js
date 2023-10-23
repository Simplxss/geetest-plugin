import YAML from "yaml";
import fs from "node:fs";
import chokidar from "chokidar";
import lodash from "lodash";

/** 配置文件 直接借鉴yunzai配置代码 */
class XsCfg {
  constructor() {
    /** 用户设置 */
    this.configPath = "./plugins/geetest-plugin/config/";
    this.config = {};

    /** 监听文件 */
    this.watcher = { };
  }

  /**
   * 获取配置yaml
   * @param name 名称
   */
  getYaml(name) {
    let file = `${this.configPath}${name}.yaml`;
    let key = `.${name}`;

    if (this[key]) return this[key];

    this[key] = YAML.parse(fs.readFileSync(file, "utf8"));

    this.watch(file, name);

    return this[key];
  }

  /** 监听配置文件 */
  watch(file, name) {
    let key = `.${name}`;

    if (this.watcher[key]) return;

    const watcher = chokidar.watch(file);
    watcher.on("change", (path) => {
      delete this[key];
      logger.mark(`[修改配置文件][${name}]`);
      if (this[`change_${name}`]) {
        this[`change_${name}`]();
      }
    });

    this.watcher[key] = watcher;
  }

  saveYaml(name, data) {
    let file = `${this.configPath}${name}.yaml`;
    if (lodash.isEmpty(data)) {
      fs.existsSync(file) && fs.unlinkSync(file);
    } else {
      let yaml = YAML.stringify(data);
      fs.writeFileSync(file, yaml, "utf8");
    }
  }
}

export default new XsCfg();
