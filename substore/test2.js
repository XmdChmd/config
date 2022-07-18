function operator(proxies) {

  
  /* 混淆 */
  const host = 'v26-qosa.toutiaovod.com'
  const prefix = ''

  const h_method = 'GET'

  const nw = 'http'
	

  return proxies.map(p => {
    const { name, type } = p
    if (['vmess'].includes(type)) {
      /* 把 非 server 的部分都设置为 host */
      /* skip-cert-verify 肯定得 true 了 */
      p['skip-cert-verify'] = true
      p.servername = host
      p['tls-hostname'] =host
      /*p.sni =host*/
      // 这里选择整体替换 headers 还是 只替换 Host: lodash_set(p, 'ws-opts.headers', { Host: host }) 
      lodash_set(p, 'ws-opts.headers.Host', host)
      lodash_set(p, 'http-opts.headers.Host', [host])
      lodash_set(p, 'http-opts.headers.method', [h_method])

      lodash_set(p, 'network', [nw])

    }

    /* 排序逻辑 */
    // 默认排序值 0
    let sort = 0

    if (name.startsWith('国内') && name.includes('限速')) {
      // 国内开头且限速的 排最下面
      sort = -10
    } else if (name.startsWith('国内')) {
      // 国内开头 排默认排序的下面
      sort = -1
    } else if (name.includes('香港6')) {
      // 含关键词的排上面
      sort = 10
    } else if (name.includes('香港2')) {
      sort = 9
    } else if (name.includes('香港3')) {
      sort = 8
    } else if (name.includes('韩国')) {
      sort = 8
    } else if (name.includes('香港')) {
       // 别的香港的 排默认的上面
      sort = 1
    } 
   // 单独排个序
   if(name.startsWith('国内') && name.includes('内蒙') && name.includes('香港')){
     sort = 7
   }
    p.sort = sort
    p.name = `${prefix}${name}`
    return p
	}).sort((a, b) => b.sort - a.sort)
}


function lodash_set(t,a,e){return Object(t)!==t||(Array.isArray(a)||(a=a.toString().match(/[^.[\]]+/g)||[]),a.slice(0,-1).reduce((t,e,r)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(a[r+1])>>0==+a[r+1]?[]:{},t)[a[a.length-1]]=e),t}
