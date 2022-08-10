
console.log(`namespace ${namespace}`)

const $ = new Env('10010', {dataFile: `${namespace==='xream'?'':`${namespace}-`}10010-box.dat`})

$.isRequest = () => typeof $request !== 'undefined' 
$.isV2p = () => typeof $evui !== 'undefined'
$.isPanel = () => $.isSurge() && typeof $input != 'undefined' && $.lodash_get($input, 'purpose') === 'panel'
$.isTile = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'tile'

const KEY_INITED = `@${namespace}.10010.inited`
const KEY_DISABLED = `@${namespace}.10010.disabled`
const KEY_COOKIE = `@${namespace}.10010.cookie`
const KEY_APPID = `@${namespace}.10010.appId`
const KEY_MOBILE = `@${namespace}.10010.mobile`
const KEY_PASSWORD = `@${namespace}.10010.password`
const KEY_TITLE = `@${namespace}.10010.title`
const KEY_SUBTITLE = `@${namespace}.10010.subtitle`
const KEY_BODY = `@${namespace}.10010.body`
const KEY_DETAIL = `@${namespace}.10010.detail`
const KEY_DETAIL_TEXT = `@${namespace}.10010.detailText`
const KEY_EXCLUDE_REMAIN_PKG = `@${namespace}.10010.excludeRemainPkg`
const KEY_FREE_PKG = `@${namespace}.10010.freePkg`
const KEY_OTHER_PKG = `@${namespace}.10010.otherPkg`
const KEY_IGNORE_FLOW = `@${namespace}.10010.ignoreFlow`
const KEY_REMAIN_FLOW_ONLY = `@${namespace}.10010.remainFlowOnly`
const KEY_OTHER_PKG_TPL = `@${namespace}.10010.otherPkgTpl`
const KEY_SYSTEM_NOTIFY_DISABLED = `@${namespace}.10010.systemNotifyDisabled`
const KEY_REQUEST_NOTIFY_DISABLED = `@${namespace}.10010.requestNotifyDisabled`
const KEY_PANEL_NOTIFY_DISABLED = `@${namespace}.10010.panelNotifyDisabled`
const KEY_TILE_NOTIFY_DISABLED = `@${namespace}.10010.tileNotifyDisabled`
const KEY_NOTIFY_DISABLED = `@${namespace}.10010.notifyDisabled`
const KEY_BARK = `@${namespace}.10010.bark`

$.setdata(new Date().toLocaleString('zh'), KEY_INITED)

let resul{}
!(async () => {
  // if (typeof $request !== 'undefined') {
)
  // } else {
 t')

onst disabled = $.getdata(KEY_DISABLED)
  if (String(disabled) === 'true') {
    $.log('ℹ️ 已禁用')
    $.log(
    $.log('ℹ️ 已禁用')
    $.log('ℹ️ 已禁用'
  }
  let cookie = $.getdata(KEY_COOKIE)
  const appId = $.getdata(KEY_APPID)
  const mobile = $.getdata(KEY_MOBILE)
  const password = $.getdata(KEY_PASSWORD)

  if (!cookie && (!appId || !mobile || !password)) {
    throw new Error('⚠️ 请配置 Cookie 或 appId, 手机号(mobile), 密码(password) 记得保存')
  }
  let needSign
  if (cookie) {
    $.log('ℹ️ 有 Cookie 尝试使用 Cookie 进行查询')
    // await info({ cookie })
    try {
      await query({ cookie })
12      if (String(e).indexOf('Cookie 无效') === -1) {
        throw e
      }
      needSign = true
      $.log('ℹ️ Cookie 无效, 将尝试自动登录')
    }
  } else {
    needSign = true
  }
  if (needSign) {
    $.log('ℹ️ 自动登录')12
    const signRes = await sign({ mobile, password, appId })
    cookie = $.lodash_get(signRes, 'cookie')
    await query({ cookie })
  }

  // }
})()
  .catch(async e => {
    console.log(e)
    await notify(namespace === 'xream' ? '10010' : `10010(${namespace})`, `❌`, `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`, {})31
  })
  .finally(() => {
    if ($.isV2p()) {
      $.done()
    } else if ($.isPanel()) {
      let arg
      if (typeof $argument != 'undefined') {
        arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
      }
      $.done({
        title: $.lodash_get(detail, 'msg.title'),
        content: `${$.lodash_get(detail, 'msg.subtitle')}\n${$.lodash_get(detail, 'msg.body')}`,
        ...arg,
      })
    } else if ($.isTile()) {
      $.done({
        title: `${$.lodash_get(detail, 'msg.title')}`,
        content: `${$.lodash_get(detail, 'msg.subtitle')}\n${$.lodash_get(detail, 'msg.body')}`,
      })
    } else {
      $.done(result)
    }
  })

async function query({ cookie }) {
  $.log('〽️ 开始进行余量查询')
  const res = await $.http.post({
    url: 'https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContentRevisedInJune',
    headers: { cookie },
  })
  const status = $.lodash_get(res, 'status')
  $.log('↓ res status')
  $.log(status)
  let body = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
  try {
    body = JSON.parse(body)
  } catch (e) {}
  $.log('↓ res body')
  console.log($.toStr(body))
  const code = String($.lodash_get(body, 'code'))
  const desc = $.lodash_get(body, 'desc')
  let errMsg = '未知错误'
  if (code !== '0000') {
    if (String(body) === '999999' || String(body) === '999998') {
      errMsg = 'Cookie 无效'
    } else if(code === '4114030182'){
      errMsg = '系统升级'
      if (String($.getdata(KEY_SYSTEM_NOTIFY_DISABLED)) === 'true') {
        $.log('禁用联通系统升级时的通知')
        return
      }
    } else if(desc){
      errMsg = desc
    }
    throw new Error(errMsg)
  }

  const now = new Date().getTime()

  const titleTpl = $.getdata(KEY_TITLE) || '[套]'
  const subtitleTpl = $.getdata(KEY_SUBTITLE) || '时长 [时] 跳 [跳] 免 [免]'
  const bodyTpl = $.getdata(KEY_BODY) || '剩余 [剩] [单] 免流 [总免]'
  const otherPkgTpl = $.getdata(KEY_OTHER_PKG_TPL) || '[包]:[用]'//'[包] 剩余[剩] 已用[用]'

  const ignoreFlow = $.getdata(KEY_IGNORE_FLOW) || 0
  const remainFlowOnly = String($.getdata(KEY_REMAIN_FLOW_ONLY)) === 'true'
  const requestNotifyDisabled = String($.getdata(KEY_REQUEST_NOTIFY_DISABLED)) === 'true'
  const panelNotifyDisabled = String($.getdata(KEY_PANEL_NOTIFY_DISABLED)) === 'true'
  const tileNotifyDisabled = String($.getdata(KEY_TILE_NOTIFY_DISABLED)) === 'true'
  const notifyDisabled = String($.getdata(KEY_NOTIFY_DISABLED)) === 'true'
  const time = $.lodash_get(body, 'time')
  const packageName = $.lodash_get(body, 'packageName')
  const sum = $.lodash_get(body, 'summary.sum')
  const freeFlow = $.lodash_get(body, 'summary.freeFlow')

  console.log(`当前套餐: ${packageName}`)
  console.log(`当前时间: ${new Date(now).toLocaleString('zh')}`)
  console.log(`查询时间(联通): ${time}`)
  console.log(`已用流量(联通原始值): ${formatFlow(sum, 2)}`)
  console.log(`已免流量(联通原始值): ${formatFlow(freeFlow, 2)}`)
  console.log(`流量变化忽略阈值: ${formatFlow(ignoreFlow, 2)}`)
  console.log(`当前时间段内有*非免流*才会通知: ${remainFlowOnly}`)

  const excludeRemainPkgRegExpStr = $.getdata(KEY_EXCLUDE_REMAIN_PKG)
  let excludeRemainPkgRegExp
  if (excludeRemainPkgRegExpStr) {
    excludeRemainPkgRegExp = new RegExp(excludeRemainPkgRegExpStr)
    console.log(`不计算剩余流量的流量包名正则: ${excludeRemainPkgRegExp}`)
  }
  const freePkgRegExpStr = $.getdata(KEY_FREE_PKG)
  let freePkgRegExp
  if (freePkgRegExpStr) {
    freePkgRegExp = new RegExp(freePkgRegExpStr)
    console.log(`叠加到免流流量的流量包名正则: ${freePkgRegExp}`)
  }
  const otherPkgRegExpStr = $.getdata(KEY_OTHER_PKG)
  let otherPkgRegExp
  if (otherPkgRegExpStr) {
    otherPkgRegExp = new RegExp(otherPkgRegExpStr)
    console.log(`需要单独显示的的流量包名正则: ${otherPkgRegExp}`)
  }

  detail.now = now
  detail.time = time
  detail.packageName = packageName
  detail.sum = sum
  detail.freeFlow = freeFlow

  const resourcesConfig = {
    resources: { name: '套餐内流量&流量包' },
    unshared: { name: '套餐内流量&流量包(非共享)' },
    rzbresources: { name: '日租宝' },
    mlresources: { name: '免流流量' },
    twresources: { name: '套外流量' },
  }

  const pkgs = []
  detail.other = []
  detail.addUpFree = 0
  detail.remain = 0
  detail.total = 0
  detail.tw = 0
  detail.resources = {}
  for (const key in body) {
    const field = String(key).toLowerCase()
    if (field.indexOf('resources') !== -1 || field === 'unshared') {
      detail.resources[field] = {}
      const resources = $.lodash_get(body, key) || []
      resources.map(resource => {
        const type = $.lodash_get(resource, 'type')
        if (!type || String(type).toLowerCase().indexOf('flow') !== -1) {
          const userResource = $.lodash_get(resource, 'userResource') || $.lodash_get(resource, 'rzbAllUse')
          const name = $.lodash_get(resourcesConfig, `${field}.name`) || key
          console.log(`${name}: 已用 ${formatFlow(userResource, 2)}`)
          pkgs.push(`${name}: 已用 ${formatFlow(userResource, 2)}`)

          detail.resources[field].name = name
          detail.resources[field].userResource = userResource
          detail.resources[field].details = []

          const details = $.lodash_get(resource, 'details') || []
          details.map((pkg, index) => {
            const limited = $.lodash_get(pkg, 'limited')
            const feePolicyName = $.lodash_get(pkg, 'feePolicyName')
            const addUpItemName = $.lodash_get(pkg, 'addUpItemName')
            const pkgFullName = addUpItemName ? `${feePolicyName}（${addUpItemName}）` : `${feePolicyName}`
            const total = $.lodash_get(pkg, 'total')
            const remain = $.lodash_get(pkg, 'remain')
            const use = $.lodash_get(pkg, 'use')
            console.log(`[${index + 1}] ${pkgFullName}`)
            pkgs.push(`[${index + 1}] ${pkgFullName}`)

            let otherPkgName
            if (otherPkgRegExp) {
              const otherPkgMatchedArray = pkgFullName.match(otherPkgRegExp)
              if (otherPkgMatchedArray) {
                otherPkgName = otherPkgMatchedArray[1]
              }
            }

            if (String(limited) === '1') {
              console.log(`已用 ${formatFlow(use, 2)}`)
              pkgs.push(`已用 ${formatFlow(use, 2)}`)
              const item = { feePolicyName, addUpItemName, pkgFullName, limited, use }
              detail.resources[field].details.push(item)
              if (otherPkgName) {
                console.log(`需要单独显示: 匹配 ${otherPkgName}`)
                pkgs.push(`需要单独显示: 匹配 ${otherPkgName}`)
                item.otherPkgName = otherPkgName
                detail.other.push(item)
              } else {
                // console.log(`不需要单独显示`)
                // pkgs.push(`不需要单独显示`)
              }
            } else {
              console.log(`已用 ${formatFlow(use, 2)}, 剩余 ${formatFlow(remain, 2)}/共 ${formatFlow(total, 2)}`)
              pkgs.push(`已用 ${formatFlow(use, 2)}, 剩余 ${formatFlow(remain, 2)}/共 ${formatFlow(total, 2)}`)
              let excludeRemainPkgName
              if (excludeRemainPkgRegExp) {
                const excludeRemainPkgMatchedArray = pkgFullName.match(excludeRemainPkgRegExp)
                if (excludeRemainPkgMatchedArray) {
                  excludeRemainPkgName = excludeRemainPkgMatchedArray[1]
                }
              }
              if (excludeRemainPkgName) {
                console.log(`不计算剩余: 匹配 ${excludeRemainPkgName}`)
                pkgs.push(`不计算剩余: 匹配 ${excludeRemainPkgName}`)
              } else {
                if (remain >= 0) {
                  console.log(`计算剩余`)
                  pkgs.push(`计算剩余`)
                  detail.remain += parseFloat(remain)
                  detail.total += parseFloat(total)
                } else {
                  console.log(`不计算剩余: 剩余 ${remain} 应>=0`)
                  pkgs.push(`不计算剩余: 剩余 ${remain} 应>=0`)
                }
              }
              const item = { feePolicyName, addUpItemName, pkgFullName, limited, use, remain, total }
              detail.resources[field].details.push(item)
              if (otherPkgName) {
                console.log(`需要单独显示: 匹配 ${otherPkgName}`)
                pkgs.push(`需要单独显示: 匹配 ${otherPkgName}`)
                item.otherPkgName = otherPkgName
                detail.other.push(item)
              } else {
                // console.log(`不需要单独显示`)
                // pkgs.push(`不需要单独显示`)
              }
            }
            let freePkgName
            if (freePkgRegExp) {
              const freePkgMatchedArray = pkgFullName.match(freePkgRegExp)
              if (freePkgMatchedArray) {
                freePkgName = freePkgMatchedArray[1]
              }
            }
            if (freePkgName) {
              if (use >= 0) {
                console.log(`计算额外免流: 匹配 ${freePkgName}`)
                pkgs.push(`计算额外免流: 匹配 ${freePkgName}`)
                detail.addUpFree += parseFloat(use)
              } else {
                console.log(`不计算额外免流: 已用 ${use} 应>=0`)
                pkgs.push(`不计算额外免流: 已用 ${use} 应>=0`)
              }
            } else {
              // console.log(`不计算额外免流`)
              // pkgs.push(`不计算额外免流`)
            }
          })
        }
      })
    }
  }
  detail.free = parseFloat(detail.freeFlow) + parseFloat(detail.addUpFree)
  let tw = parseFloat($.lodash_get(detail, 'resources.twresources.userResource'))
  if (!isNaN(tw) && tw > 0) {
    detail.tw = tw  
  }
  const lastDetail = $.getjson(KEY_DETAIL)
  console.log('上次记录:')
  console.log(lastDetail)
  console.log('本次记录:')
  console.log(detail)
  const resourcesDetails = $.lodash_get(detail, 'resources.resources.details')
  const unsharedDetails = $.lodash_get(detail, 'resources.unshared.details')
  const rzbresourcesDetails = $.lodash_get(detail, 'resources.rzbresources.details')
  consttwresourcesDetails = $.lodash_get(detail, 'resources.twresources.details')
  if ((!Array.isArray(resourcesDetails) || resourcesDetails.length === 0) && (!Array.isArray(unsharedDetails) || unsharedDetails.length === 0) && (!Array.isArray(rzbresourcesDetails) || rzbresourcesDetails.length === 0) && (!Array.isArray(consttwresourcesDetails) || consttwresourcesDetails.length === 0)) {
    console.log(`联通未返回包数据 正常情况 习惯就好 🔚`)
    return
  }
  let duration = 0
  let durationFree = 0
  let durationNotFree = 0
  let durationRemain = 0
  let durationTw = 0
  if (lastDetail) {
    duration = (now - parseFloat($.lodash_get(lastDetail, 'now'))) / 1000 / 60
    if (!isNaN(duration) && duration > 0) {
      durationFree = parseFloat(detail.free) - parseFloat($.lodash_get(lastDetail, 'free'))
      durationTw = parseFloat(detail.tw) - parseFloat($.lodash_get(lastDetail, 'tw'))
      durationRemain = parseFloat($.lodash_get(lastDetail, 'remain')) - parseFloat(detail.remain)
      durationNotFree = durationRemain + durationTw
    } else {
      duration = 0
    }
  }

  const otherText = detail.other
    .map(i => {
      return otherPkgTpl
        .replace('[包]', i.otherPkgName)
        .replace('[剩]', i.remain == null ? '-' : formatFlowSmall(i.remain, 2))
        .replace('[用]', i.use == null ? '-' : formatFlowSmall(i.use, 2))
        .replace(/  +/g, ' ')
    })
    .join('')
  const msgData = {
    ...detail,
    duration,
    durationNotFree,
    durationFree,
    otherText,
    now: new Date(detail.now).toLocaleString('zh'),
    pkgs,
  }
  const msg = {
    title: renderTpl(titleTpl, msgData),
    subtitle: renderTpl(subtitleTpl, msgData),
    body: renderTpl(bodyTpl, msgData),
  }
  detail.msg = msg
  // 保存 detail
  $.setjson(detail, KEY_DETAIL)
  // 附加 cookie
  detail.cookie = cookie
  const detailText = `当前套餐: ${detail.packageName}
当前时间: ${new Date(detail.now).toLocaleString('zh')}
查询时间(联通): ${detail.time}
已用流量(联通原始值): ${formatFlow(detail.sum, 2)}
已免流量(联通原始值): ${formatFlow(detail.freeFlow, 2)}
${pkgs.join('\n')}
总剩余流量: ${formatFlow(detail.remain, 2)}
总共流量: ${formatFlow(detail.total, 2)}
额外免流流量: ${formatFlow(detail.addUpFree, 2)}
修正后总免流: ${formatFlow(detail.free, 2)}
套外总流量: ${formatFlow(detail.tw, 2)}
间隔时长: ${formatDuration(duration)}
期间免流: ${formatFlow(durationFree, 2)}
期间非免: ${formatFlow(durationNotFree, 2)}
流量变化忽略阈值: ${formatFlow(ignoreFlow, 2)}
当前时间段内有*非免流*才会通知: ${remainFlowOnly}
通知标题模板: ${titleTpl}
通知副标题模板: ${subtitleTpl}
通知正文模板: ${bodyTpl}
通知单独显示的包模板: ${otherPkgTpl}
单独显示: ${otherText}
通知标题: ${msg.title}
通知副标题: ${msg.subtitle}
通知正文: ${msg.body}
`

  console.log(detailText)
  
  result = {
    response: {
      status: 200,
      body: JSON.stringify(detail),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      },
    },
  }
  $.setdata(detailText, KEY_DETAIL_TEXT)
  if (durationFree < 0 || durationNotFree < 0) {
    console.log(`流量变化 < 0 可能是什么包失效了(比如月初)或者联通接口问题 本次不发送`)
  } else {
     if (notifyDisabled) {
      console.log(`禁用通知`)
    } else if ($.isRequest() && requestNotifyDisabled) {
      console.log(`禁用作为请求脚本使用时的通知`)
    } else if ($.isPanel() && panelNotifyDisabled) {
      console.log(`禁用作为 Surge 面板 (Panel) 脚本使用时的通知`)
    } else if ($.isTile() && tileNotifyDisabled) {
      console.log(`禁用作为 Stash 面板 (Tile) 脚本使用时的通知`)
    } else {
      if (durationFree >= ignoreFlow || durationNotFree >= ignoreFlow) {
        if (!remainFlowOnly || (remainFlowOnly && durationNotFree >= ignoreFlow)) {
          console.log(`未设置当前时间段内无*非免流*不通知, 或 设置了且跳>=阈值`)
          console.log(`🔔🔔🔔 通知`)
          await notify(msg.title, msg.subtitle, msg.body)
        } else {
          console.log(`当前时间段内无*非免流*, 不通知`)
        }
      } else {
        console.log(`小于流量变化忽略阈值, 不通知`);
      }
    }
  }
}


async function notify(title, subtitle, body) {
  if ($.isNode()) {
    console.log('Node 环境 尝试加载 sendNotify')
    try {
      console.log(`尝试加载 ./10010_${namespace}_sendNotify`)
      notify = require(`./10010_${namespace}_sendNotify`)
    } catch (e) {
      // console.log(e)
    }
    if (notify && notify.sendNotify) {
      console.log(`./10010_${namespace}_sendNotify 正常`)
    } else {
      try {
        console.log(`尝试加载 ./10010_sendNotify`)
        notify = require(`./10010_sendNotify`)
      } catch (e) {
        // console.log(e)
      }
      if (notify && notify.sendNotify) {
        console.log(`./10010_sendNotify 正常`)
      } else {
        try {
          console.log(`尝试加载 ./sendNotify`)
          notify = require('./sendNotify')
          if (notify && notify.sendNotify) {
            console.log(`./sendNotify 正常`)
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
    try {
      const { execSync } = require('child_process')
      if (process.env.TERMUX_VERSION) {
        console.log(execSync(`termux-notification -t "${title}" -c "${subtitle}\n${body}" --sound`,{encoding: 'utf8', timeout: 3 * 1000}))
      }
    } catch (e) {
      console.log(e)
    }
  }
  const bark = $.getdata(KEY_BARK)

  if (bark || (notify && notify.sendNotify)) {
    if (bark) {
      try {
        const url = bark.replace('[推送标题]', encodeURIComponent(title)).replace('[推送内容]', encodeURIComponent(`${subtitle}\n${body}`))
        $.log(`开始 bark 请求: ${url}`)
        $.log(`${title}\n\n${subtitle}\n\n${body}`)
        const res = await $.http.get({ url })
        // console.log(res)
        const status = $.lodash_get(res, 'status')
        $.log('↓ res status')
        $.log(status)
        let resBody = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
        try {
          resBody = JSON.parse(resBody)
        } catch (e) {}
        $.log('↓ res body')
        console.log($.toStr(resBody))
        if ($.lodash_get(resBody, 'code') !== 200) {
          throw new Error($.lodash_get(resBody, 'message') || '未知错误')
        }
      } catch (e) {
        console.log(e)
        $.msg(namespace === 'xream' ? '10010' : `10010(${namespace})`, `❌ bark 请求`, `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`, {})
      }
    }

    if (notify && notify.sendNotify) {
      await notify.sendNotify(`${title}`, `${subtitle}\n${body}`)
    }
  } else if ($.isV2p()) {
    $.msg(title, '', `${subtitle}\n${body}`)
  } else {
    $.msg(title, subtitle, body)
  }
}
function renderTpl(tpl, data) {
  return tpl
    .replace('[套]', data.packageName || '')
    .replace('[总免]', formatFlow(data.free, 2))
    .replace('[总用]', formatFlow(data.sum, 2))
    .replace('[时]', formatDuration(data.duration))
    .replace('[现]', data.now)
    .replace('[跳]', formatFlow(data.durationNotFree, 2))
    .replace('[免]', formatFlow(data.durationFree, 2))
    .replace('[剩]', formatFlowSmall(data.remain, 2))
    .replace('[总]', formatFlow(data.total, 2))
    .replace('[套外]', formatFlow(data.tw, 2))
    .replace('[单]', data.otherText)
    .replace('[详]', data.pkgs?data.pkgs.join('\n'): '')
    .replace(/  +/g, ' ')
}

async function info({ cookie }) {
  $.log('〽️ 开始进行信息查询')
  const res = await $.http.post({
    url: 'https://m.client.10010.com//mobileserviceimportant/home/queryUserInfoSeven',
    headers: { cookie },
  })
  const status = $.lodash_get(res, 'status')
  $.log('↓ res status')
  $.log(status)
  let body = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
  try {
    body = JSON.parse(body)
  } catch (e) {}
  $.log('↓ res body')
  console.log($.toStr(body))
  if ($.lodash_get(body, 'code') !== 'Y') {
    if (String(body) === '999999' || String(body) === '999998') {
      throw new Error('Cookie 无效')
    }
    throw new Error('未知错误')
  }
  const title = $.lodash_get(body, 'flush_date_time')
  const dataList = $.lodash_get(body, 'data.dataList') || []
  const content = dataList
    .map(i => `${$.lodash_get(i, 'remainTitle')} ${$.lodash_get(i, 'number')}${$.lodash_get(i, 'unit')}`)
    .join('; ')
  console.log(title)
  console.log(content)
}
async function sign({ mobile, password, appId }) {
  $.log('〽️ 开始进行登录')
  const res = await $.http.post({
    url: 'https://m.client.10010.com/mobileService/login.htm',
    body: transParams({
      mobile: RSAEncrypt(mobile),
      password: RSAEncrypt(password),
      appId,
      version: 'iphone_c@9.0100',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  // console.log(res)
  const status = $.lodash_get(res, 'status')
  $.log('↓ res status')
  $.log(status)
  let body = String($.lodash_get(res, 'body') || $.lodash_get(res, 'rawBody'))
  try {
    body = JSON.parse(body)
  } catch (e) {}
  $.log('↓ res body')
  console.log($.toStr(body))
  if ($.lodash_get(body, 'code') !== '0') {
    throw new Error($.lodash_get(body, 'dsc') || '未知错误')
  }
  const headers = $.lodash_get(res, 'headers') || {}
  let cookie = $.lodash_get(headers, 'set-cookie') || $.lodash_get(headers, 'Set-Cookie')
  if (Array.isArray(cookie)) {
    cookie = cookie.join('; ')
  }
  console.log(`🍪 登录 Cookie`)
  console.log(cookie)
  if (!cookie) {
    throw new Error(`登录 Cookie 为空`)
  }
  $.setdata(cookie, KEY_COOKIE)
  return { cookie }

  // const title = $.lodash_get(body, 'flush_date_time')
  // const dataList = $.lodash_get(body, 'data.dataList') || []
  // const content = dataList
  //   .map(i => `${$.lodash_get(i, 'remainTitle')} ${$.lodash_get(i, 'number')}${$.lodash_get(i, 'unit')}`)
  //   .join('; ')
  // console.log(title)
  // console.log(content)
}

function createRound(methodName) {
  const func = Math[methodName]
  return (number, precision) => {
    precision = precision == null ? 0 : precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292)
    if (precision) {
      // Shift with exponential notation to avoid floating-point issues.
      // See [MDN](https://mdn.io/round#Examples) for more details.
      let pair = `${number}e`.split('e')
      const value = func(`${pair[0]}e${+pair[1] + precision}`)

      pair = `${value}e`.split('e')
      return +`${pair[0]}e${+pair[1] - precision}`
    }
    return func(number)
  }
}
function round(...args) {
  return createRound('round')(...args)
}
function formatFlow(number, precision) {
  if (!Number.isFinite(Number.parseFloat(number))) {
    return '0M'
  }
  if (number < 1024) {
    return round(number, precision) + 'M'
  }
  if (number < 1024 * 1024) {
    return round(number/1024, precision) + 'G'
  }
  return round(number / 1024 / 1024, precision) + 'T'
}
function formatFlowSmall(number, precision) {
  if (!Number.isFinite(Number.parseFloat(number))) {
    return '0M'
  }
  if (number < 1024) {
    return (round(number, precision) + 'M')
  }
  if (number < 1024 * 1024) {
    return round(number, precision) + 'M' + '-' + round(number/1024, precision) + 'G\n'
  }
  return round(number / 1024 / 1024, precision) + 'T'
}
function formatDuration(number, precision) {
  if (number < 60) {
    return round(number, precision) + '分钟'
  }
  if (number < 60 * 24) {
    return round(number / 60, precision) + '小时'
  }
  return round(number / 60 / 24, precision) + '天'
}
function transParams(data) {
  return Object.keys(data)
    .map(k => `${k}=${encodeURIComponent(data[k])}`)
    .join('&')
  // let params = new URLSearchParams()
  // for (let item in data) {
  //   params.append(item, data['' + item + ''])
  // }
  // return params
}

function RSAEncrypt(message) {
  var encrypt = new JSEncrypt()
  var pKey =
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc+CZK9bBA9IU+gZUOc6FUGu7yO9WpTNB0PzmgFBh96Mg1WrovD1oqZ+eIF4LjvxKXGOdI79JRdve9NPhQo07+uqGQgE4imwNnRx7PFtCRryiIEcUoavuNtuRVoBAm6qdB0SrctgaqGfLgKvZHOnwTjyNqjBUxzMeQlEC2czEMSwIDAQAB'
  encrypt.setPublicKey(pKey)
  var encrypted = encrypt.encrypt(message)
  return encrypted
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,o)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),h={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"}};this.post(h,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,h=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:h},h)},t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then(t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,h=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:h},h)},t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",o){const r=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,r(o)):this.isQuanX()&&$notify(e,s,i,r(o))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}
