/*
签到集合
适合类型：通天塔签到共建
0 0,1 * * * jd_flsSign.js
 */
const $ = new Env('通天塔签到集合');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '';

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  try {
    let promiseArr = null;

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/2BspupMr6qenk9JUWpbAnepLHjwy/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/3EVVqbSAdb1jWkED4D6rhVX1Xyf4/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/4Vh5ybVr98nfJgros5GwvXbmTUpg/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://prodev.m.jd.com/mall/active/KcfFqWvhb5hHtaQkS4SD1UU6RcQ/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/3SC6rw5iBg66qrXPGmZMqFDwcyXi/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/2QUxWHx5BSCNtnBDjtt5gZTq7zdZ/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/4RBT3H9jmgYg1k2kBnHF8NAHm7m8/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/ZrH7gGAcEkY2gH8wXqyAPoQgk6t/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/3joSPpr7RgdHMbcuqoRQ8HbcPo9U/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/3S28janPLYmtFxypu37AYAGgivfp/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/4RXyb1W4Y986LJW8ToqMK14BdTD/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => getActInfo(ck, index, 'https://pro.m.jd.com/mall/active/kPM3Xedz1PBiGQjY4ZYGmeVvrts/index.html'));
    await Promise.all(promiseArr);

    promiseArr = cookiesArr.map((ck, index) => signBeanIndex(ck, index));
    await Promise.all(promiseArr);
  } catch (e) {
    $.logErr(e)
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })
function getActInfo(taskCookie, index, url='') {
  // url = `https://pro.m.jd.com/mall/active/${url}/index.html`;
  if (index === 0) console.log(`活动地址：${url}`)
  const userName = decodeURIComponent(taskCookie.match(/pt_pin=([^; ]+)(?=;?)/) && taskCookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
  return new Promise(resolve => {
    $.get({
      url: url,
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "cookie": cookie,
        "referer": url,
        "user-agent": "JD4iPhone/167220 (iPhone; iOS 13.7; Scale/3.00)"
        // "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
        // "user-agent": $.isNode() ? process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : require('./USER_AGENTS').USER_AGENT : $.getdata('JDUA') ? $.getdata('JDUA') : 'jdjchapp;jdlog;iPhone;1.2.0;15.2;09f660807a77e6a31f1ddad5beec9a56b194c0a5;Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;'
      }
    },async (err,resp,data)=>{
      try {
        data = data.match(/window.__react_data__ = (.*)}/);
        if (data && data[1]) {
          data = $.toObj(data[1] + '}');
          if (data && data.activityData && data.activityData.floorList) {
            let paramsArr = data.activityData.floorList.filter(vo => vo.template === 'customcode');
            for (const item of paramsArr) {
              if (item['boardParams'] && item['boardParams']['interaction']) {
                $.boardParams = item['boardParams'];
                break
              }
            }
            if ($.boardParams) {
              const { title = "", interaction = '' } = $.boardParams;
              if (!interaction) {
                console.log(`京东账号${index + 1} ${userName} 获取签到所需params失败，退出签到！\n`);
                return
              }
              console.log(`京东账号${index + 1} ${userName} 开始【${title || '生活特权天天领京豆'}】签到`)
              await sign(taskCookie, index, $.toObj(interaction, {}));
            } else {
              console.log(`paramsArr获取失败：${$.toStr(paramsArr)}\n`);
            }
          } else {
            console.log(`京东账号${index + 1} ${userName} 签到数据获取异常！手动签到地址：${data.activityInfo.pageUrl}\n`)
          }
        }
      } catch (e) {
        console.log(e)
      }
      finally {
        resolve()
      }
    })
  })
}

function sign(taskCookie, index, params) {
  return new Promise(resolve => {
    const body = {
      "encryptProjectId":params.encryptProjectId,
      "encryptAssignmentId":params.encryptAssignmentId,
      "completionFlag":true,
      "itemId": "1",
      "sourceCode":"aceaceqingzhan"
    }
    const options = {
      url: `${JD_API_HOST}?functionId=doInteractiveAssignment`,
      body: `appid=babelh5&body=${encodeURIComponent(JSON.stringify(body))}&sign=11&t=${Date.now()}`,
      headers: {
        'Host': 'api.m.jd.com',
        'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'accept': '*/*',
        'referer': 'https://pro.m.jd.com/',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': taskCookie
      }
    }

    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log($.toStr(err));
        } else {
          // console.log(`签到结果`, data)
          const userName = decodeURIComponent(taskCookie.match(/pt_pin=([^; ]+)(?=;?)/) && taskCookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
          data = $.toObj(data);
          if (data) {
            if (data['code'] === '0' && data['subCode'] === '0') {
              console.log(`京东账号${index + 1} ${userName} 签到成功：${$.toStr(data)}\n`);
              if (data['rewardsInfo']) {
                const { successRewards = {} } = data['rewardsInfo'];
                console.log(`京东账号${index + 1} ${userName} 签到获得：${$.toStr(successRewards)}\n`);
              }
            } else {
              console.log(`京东账号${index + 1} ${userName} 签到失败：${$.toStr(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}
function signBeanIndex(taskCookie, index) {
  return new Promise(resolve => {
    const options = {
      url: `https://api.m.jd.com/client.action`,
      body: `functionId=signBeanIndex&appid=ld`,
      headers: {
        'Host': 'api.m.jd.com',
        'user-agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'accept': '*/*',
        'referer': 'https://pro.m.jd.com/',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': taskCookie
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log($.toStr(err));
        } else {
          // console.log(`签到结果`, data)
          const userName = decodeURIComponent(taskCookie.match(/pt_pin=([^; ]+)(?=;?)/) && taskCookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
          data = $.toObj(data);
          if (data) {
            if (data['code'] === '0' && data.data) {
              const { status = '', dailyAward = {}, continuityAward = {}} = data.data;
              if (status === '1') {
                console.log(`京东账号${index + 1} ${userName}\n京东商城签到日历签到成功：${dailyAward.title ? dailyAward.title + dailyAward.subTitle + dailyAward.beanAward.beanCount : continuityAward['title'] + '：' + continuityAward.beanAward.beanCount}京豆\n`);
              } else {
                console.log(`京东账号${index + 1} ${userName}\n京东商城签到日历签到失败：${dailyAward.title ? dailyAward.title + dailyAward.subTitle + dailyAward.beanAward.beanCount : continuityAward['title'] + '：' + continuityAward.beanAward.beanCount}京豆\n`);
              }
            } else {
              console.log(`京东账号${index + 1} ${userName}\n京东商城签到日历签到异常：${$.toStr(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
