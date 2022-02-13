/*
10 9-14/1 * * * jd_syj.js
 */
const tool = new require('./utils/zjdTool.js');
const jdCookieNode =  require('./jdCookie.js');
const $ = Env('赚京豆');
$.CryptoJS = require('crypto-js');
$.fingerprintInfo = {'d8ac0':'','dde2b':'','b9790':''};
$.appIdInfo = {};
$.uuid = '';
$.tuanList = [];
let cookiesArr = [];
Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
})
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    let account = createMaxGroup() * 3 - 2;//保险起见，减去一个2
    console.log(`\n开始前面${account}个账号进行开团\n`)
    for (let i = 0; i < account; i++) {
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        console.log(`\n*****开始【京东账号${$.index}】${$.UserName}*****\n`);
        await main();
        await $.wait(2000);
    }
    cookiesArr = getRandomArrayElements(cookiesArr,cookiesArr.length);
    console.log($.tuanList)
    for (let i = 0; i < cookiesArr.length; i++) {
        $.canHelp = true
        if (cookiesArr[i]) {
            $.cookie = cookiesArr[i];
            $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            if ($.canHelp && (cookiesArr.length > $.assistNum)) {
                for (let j = 0; j < $.tuanList.length; ++j) {
                    $.oneInfo = $.tuanList[j];
                    if($.UserName === $.tuanList[j].user || $.oneInfo.max){
                        continue;
                    }
                    console.log(`\n账号 ${$.UserName} 开始给 【${$.tuanList[j]['user']}】助力`)
                    await helpFriendTuan($.tuanList[j].id)
                    await $.wait(3000)
                    if(!$.canHelp) break
                }
            }
        }
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
});

async function main() {
  try {
    $.tuan = ''
    $.hasOpen = false;
    $.assistStatus = 0;
    $.uuid = randomWord(true,16,16)
    await getUserTuanInfo();
    if (!$.tuan && ($.assistStatus === 3 || $.assistStatus === 2 || $.assistStatus === 0) && $.canStartNewAssist) {
      console.log(`准备再次开团`);
      let openInfo = await sendInfo('vvipclub_distributeBean_startAssist',{"activityIdEncrypted": $.tuanActId, "channel": "FISSION_BEAN"},'dde2b');
      if (openInfo['success']) {
        console.log(`【赚京豆(微信小程序)-瓜分京豆】开团成功`)
        $.hasOpen = true
      } else {
        console.log(`\n开团失败：${JSON.stringify(data)}\n`)
      }
    }
    if ($.hasOpen) await getUserTuanInfo();
    if ($.tuan && $.tuan.hasOwnProperty('assistedPinEncrypted') && $.assistStatus !== 3) {
      $.tuanList.push({'id':$.tuan,'user':$.UserName,'max':false});
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function helpFriendTuan(body) {
  try {
    let data = await sendInfo('vvipclub_distributeBean_assist',body,'b9790');
    if (data.success) {
      console.log('助力结果：助力成功')
    } else {
      if (data.resultCode === '9200008'){
        console.log('助力结果：不能助力自己')
      } else if (data.resultCode === '9200011'){
        console.log('助力结果：已经助力过')
      } else if (data.resultCode === '2400205') {
        console.log('助力结果：团已满'),$.oneInfo.max = true;
      } else if (data.resultCode === '2400203') {
        console.log('助力结果：助力次数已耗尽');$.canHelp = false
      } else if (data.resultCode === '9000000') {
        console.log('助力结果：活动火爆，跳出');$.canHelp = false
      } else {
        console.log(`助力结果：未知错误：${JSON.stringify(data)}`)
      }
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function getUserTuanInfo(){
    let activityInfo = await sendInfo('distributeBeanActivityInfo',{"paramData":{"channel":"FISSION_BEAN"}},'d8ac0');
    if(!activityInfo.success){
        console.log(JSON.stringify(activityInfo))
        return ;
    }
    activityInfo = activityInfo.data;
    console.log(`\n当前【赚京豆(微信小程序)-瓜分京豆】能否再次开团: ${activityInfo.canStartNewAssist ? '可以' : '否'}`);
    if (activityInfo && !activityInfo.canStartNewAssist) {
        $.tuan = {
            "activityIdEncrypted": activityInfo.id,
            "assistStartRecordId": activityInfo.assistStartRecordId,
            "assistedPinEncrypted": activityInfo.encPin,
            "channel": "FISSION_BEAN"
        }
    }
    if (activityInfo.assistStatus === 1 && !activityInfo.canStartNewAssist) {
        console.log(`已开团(未达上限)，但团成员人未满\n\n`)
    } else if (activityInfo.assistStatus === 3 && activityInfo.canStartNewAssist) {
        console.log(`已开团(未达上限)，团成员人已满，可重新开下一队\n\n`)
    } else if (activityInfo.assistStatus === 3 && !activityInfo.canStartNewAssist) {
        console.log(`今日开团已达上限，且当前团成员人已满\n\n`)
    } else if (activityInfo.assistStatus === 2 && !activityInfo.canStartNewAssist) {
      console.log(`超时未助力成功(今日开团次数已达上限)\n\n`)
      $.tuan = '';
    }
    $.tuanActId = activityInfo.id;
    $.assistNum = activityInfo['assistNum'] || 4;
    $.assistStatus = activityInfo['assistStatus'];
    $.canStartNewAssist = activityInfo['canStartNewAssist'];
}


async function sendInfo(functionID,bodyInfo,appId) {
    let url = `https://api.m.jd.com/api?functionId=${functionID}&fromType=wxapp&timestamp=${Date.now()}`;
    let body =`body=${JSON.stringify(bodyInfo)}&appid=swat_miniprogram&uuid=${$.uuid}&client=tjj_m&clientVersion=3.1.3`;
    let h5st = await getH5st(`${url}&${body}`,appId);
    //console.log('h5st:'+h5st);
    return new Promise(resolve => {
        let  options = {
            url: url,
            body: `body=${encodeURIComponent(JSON.stringify(bodyInfo))}&appid=swat_miniprogram&h5st=${encodeURIComponent(h5st)}&uuid=${$.uuid}&client=tjj_m&screen=1920*1080&osVersion=5.0.0&networkType=wifi&sdkName=orderDetail&sdkVersion=1.0.0&clientVersion=3.1.3&area=11`,
            headers: {
                'Cookie' : `${$.cookie}appid=wxa5bf5ee667d91626;wxclient=gxhwx;ie_ai=1;`,
                'content-type' : `application/x-www-form-urlencoded`,
                'Connection' : `keep-alive`,
                'Accept-Encoding' : `gzip,compress,br,deflate`,
                'Referer' : `https://servicewechat.com/wxa5bf5ee667d91626/173/page-frame.html`,
                'Host' : `api.m.jd.com`,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

async function getH5st(url,appId){
    if(!$.appIdInfo[appId]){
        $.appIdInfo[appId] = {};
        $.appIdInfo[appId].fingerprint = $.fingerprintInfo[appId] || await generateFp();
        await requestAlgo(appId);
    }
    let bodyInfo = getUrlData(url, 'body');
    if(!bodyInfo){
        throw new Error("找不到body");
    }
    const bodySign = $.CryptoJS.SHA256(bodyInfo).toString($.CryptoJS.enc.Hex);
    url = replaceParamVal(url,'body',bodySign);
    let stk = `appid,body,client,clientVersion,functionId`;
    const signtime = Date.now();
    const timestamp = timeString('yyyyMMddhhmmssSSS',new Date(Number(signtime)));
    //console.log('hash11:'+$.CryptoJS.MD5(`${$.appIdInfo[appId].token}${$.appIdInfo[appId].fingerprint}${timestamp}${appId}`));
    let hash1 = tool.K($.appIdInfo[appId].token,$.appIdInfo[appId].fingerprint,timestamp,appId);
    //console.log('hash12:'+hash1);
    let st = '';
    stk.split(',').map((item, index) => {
        st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    let h5st = ["".concat(timestamp.toString()), "".concat($.appIdInfo[appId].fingerprint.toString()), "".concat(appId.toString()), "".concat($.appIdInfo[appId].token), "".concat(hash2), "".concat('3.0'), "".concat(signtime)].join(";");
    return h5st
}

function generateFp() {
    const str = "0123456789", rmStrLen = 3, rd = Math.random() * 10 | 0, fpLen = 16
    let rmStr = "", notStr = ""
    !((num, str) => {
        let strArr = str.split(""), res = []
        for (let i = 0; i < num; i++) {
            let rd = Math.random() * (strArr.length - 1) | 0
            res.push(strArr[rd])
            strArr.splice(rd, 1)
        }
        rmStr = res.join(""), notStr = strArr.join("")
    })(rmStrLen, str)

    return ((size, num) => {
        let u = size, u2 = (fpLen - rmStrLen - size.toString().length) - size, res = ""
        while (u--) res += num[Math.random() * num.length | 0]
        res += rmStr
        while (u2--) res += num[Math.random() * num.length | 0]
        res += size
        return res
    })(rd, notStr)
}

async function requestAlgo(appId) {
    const options = {
        "url": `https://cactus.jd.com/request_standby_algo`,
        "headers": {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Content-Type': 'application/json',
            'Origin': 'https://daily-redpacket.jd.com',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer' : `https://servicewechat.com/wxa5bf5ee667d91626/173/page-frame.html`,
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "3.0",
            "fp": $.appIdInfo[appId].fingerprint,
            "appId": appId,
            "timestamp": Date.now(),
            "platform": "applet",
            "expandParams": ""
        })
    }
    return new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            $.token = data.data.result.tk;
                            console.log(`appId:${appId},获取签名参数成功！`)
                            console.log(`token: ${$.token}`)
                            $.appIdInfo[appId].token = $.token;
                        } else {
                            console.log('request_algo 签名参数API请求失败:')
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve( );
            }
        })
    })
}
function timeString(fmt,n) {
    var d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
    };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t, a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}


function getUrlData(url, name) {
    if (typeof URL !== "undefined") {
        let urls = new URL(url);
        let data = urls.searchParams.get(name);
        return data ? data : '';
    } else {
        const query = url.match(/\?.*/)[0].substring(1)
        const vars = query.split('&')
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=')
            if (pair[0] === name) {
                // return pair[1];
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
}
function replaceParamVal(url,paramName,replaceWith) {
    var re=eval('/('+ paramName+'=)([^&]*)/gi');
    var nUrl = url.replace(re,paramName+'='+replaceWith);
    return nUrl;
}
function randomWord(randomFlag, min, max){
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}
function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
/**
 * 通过有效CK数量与最大组建数量，计算多少个CK可以创建队伍（注：每个账号只有一次助力的条件下）
 * @param len 有效CK数量
 * @param max 最大组建数量
 * @param need 组成功一个队伍需要多少CK
 * @returns {number}
 */
function createMaxGroup(len = cookiesArr.length, max = 4, need = 4) {
  let openCount = 0;
      if (len % need === 0) {
    if (len > 0 && len <= max * need + 1) {
      openCount = 1
    } else if (len === 0 || max === 0) {
      openCount = 0;
    } else {
      openCount = Math.ceil(len / (max * need + 1))
    }
  } else {
    if ((need < len && len <= max * need + 1)) {
      openCount = 1
    } else {
      if (len - Math.floor(len / (max * need)) * (max * need) > need) {
        openCount = Math.floor(len / (max * need)) + 1;
      } else {
        openCount = Math.floor(len / (max * need))
      }
    }
  }
  if (openCount === Infinity) openCount = 0;
  return openCount
}
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
