import plugin from "../../../lib/plugins/plugin.js";
import xxCfg from "../model/xxCfg.js";

export class bbsVerificationHandler extends plugin {
  constructor() {
    super({
      name: "过验证码",
      dsc: "过验证码",
      priority: -(9 ** 9),
      namespace: 'Geetest',
      handler: [{
        key: 'mys.req.err',
        fn: 'mysReqErrHandler'
      }],
    });
    this.cfg = xxCfg.getYaml("config");
    if (!this.cfg.autoAddress) this.cfg.autoAddress = '';
    if (!this.cfg.manualAddress) this.cfg.manualAddress = '';
    if (!this.cfg.blackList) this.cfg.blackList = [];
    xxCfg.saveYaml("config", this.cfg);
  }

  async mysReqErrHandler(e, options, reject) {
    let { mysApi, type, data } = options
    /** 据说5003为验证码原因 */
    let retcodeError = [1034, 5003]

    if (
      !retcodeError.includes(options.res.retcode) ||
      this.cfg.blackList.includes(e.user_id)
    ) return reject()

    /** 已验证 */
    if (e.isVerify) return await mysApi.getData(type, data)

    let self = new bbsVerificationHandler()
    self.e = e
    self.mysApi = mysApi
    self.mysApi.getUrl = (...args) => self.getUrl.call(self.mysApi, ...args)

    let verify = await self.bbsVerification()
    if (!verify) logger.error(`[米游社验证失败][uid:${e.uid || mysApi.uid}][qq:${e.user_id}]`)

    /** 仅调用过码 (即刷新米游社验证，该ltuid后续N小时内不会再触发验证码) */
    if (options.OnlyGtest) return verify

    return verify ? await mysApi.getData(type, data) : options.res
  }

  async bbsVerification() {
    let create = await this.mysApi.getData('createVerification')

    let verify = await this.autoVerify(this.e, create.data)
    if (!verify) verify = await this.mannualVerify(this.e, create.data)
    if (!verify) return false

    res = await this.mysApi.getData("verifyVerification", verify)
    if (!submit || submit.retcode !== 0) return false
    this.e.isVerify = true
    return true
  }

  /** 自动验证, 返回validate等参数 */
  async autoVerify(e, data) {
    if (!this.cfg.autoAddress) return false

    let response = await fetch(this.cfg.autoAddress.replace('{0}', data.gt).replace('{1}', data.challenge))
    if (!response.ok) {
      logger.error(`[validate][${e.uid}] ${response.status} ${response.statusText}`)
      return false
    }
    res = await response.json()
    if (res?.data?.validate) {
      logger.mark(`[米游社验证成功][${e.uid}] 消耗token一次`)
    }
    return res.data
  }

  /** 手动验证, 返回validate等参数 */
  async mannualVerify(e, data) {
    if (!this.cfg.manualAddress) return false

    let res = await fetch(this.cfg.manualAddress, {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data)
    })
    res = await res.json()
    if (!res.data) return false

    await e.reply(`请打开地址并完成验证\n${res.data.link}`, true)

    for (let i = 0; i < 80; i++) {
      let validate = await fetch(res.data.result)
      validate = await validate.json()
      if (validate.data) {
        logger.mark(`[米游社验证成功][uid:${e.uid}][qq:${e.user_id}]`)
        return validate.data
      }
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    return false
  }
}
