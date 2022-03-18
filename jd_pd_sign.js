/*
*频道签到
10 8,20 * * * jd_pd_sign.js
* */
const $ = new Env('频道签到');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0)
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
        return;
    }
    let activityList = [
        {'name':'陪伴频道','end':'1654012800000','url':'https://pro.m.jd.com/mall/active/kPM3Xedz1PBiGQjY4ZYGmeVvrts/index.html'},//2021-12-12---2022-5-31
        {'name':'箱包签到','end':'1672502400000','url':'https://pro.m.jd.com/mall/active/ZrH7gGAcEkY2gH8wXqyAPoQgk6t/index.html'},//2021-12-31---2022-12-31
        {'name':'鞋靴签到','end':'1672502400000','url':'https://pro.m.jd.com/mall/active/4RXyb1W4Y986LJW8ToqMK14BdTD/index.html'},//2021-12-31---2022-12-31
        {'name':'女装签到','end':'1672502400000','url':'https://prodev.m.jd.com/mall/active/2BspupMr6qenk9JUWpbAnepLHjwy/index.html'},//2021-12-31---2022-12-31
        {'name':'拍拍二手','end':'1656604800000','url':'https://pro.m.jd.com/mall/active/3S28janPLYmtFxypu37AYAGgivfp/index.html'},//2021-1-1---2022-6-30
        {'name':'校园签到','end':'1669824000000','url':'https://pro.m.jd.com/mall/active/2QUxWHx5BSCNtnBDjtt5gZTq7zdZ/index.html'},//2021-12-23---2022-12-1
        {'name':'服饰签到','end':'1656604800000','url':'https://pro.m.jd.com/mall/active/4RBT3H9jmgYg1k2kBnHF8NAHm7m8/index.html'},//2021-12-20---2022-6-30
        {'name':'手机小时购','end':'1648742400000','url':'https://pro.m.jd.com/mall/active/4Vh5ybVr98nfJgros5GwvXbmTUpg/index.html'},//2021-12-6---2022-3-31
        {'name':'京东图书','end':'1672502400000','url':'https://pro.m.jd.com/mall/active/3SC6rw5iBg66qrXPGmZMqFDwcyXi/index.html'},//2022-1-1---2022-12-31
        {'name':'PLUS签到','end':'1672329600000','url':'https://pro.m.jd.com/mall/active/3joSPpr7RgdHMbcuqoRQ8HbcPo9U/index.html'},//2021-12-30---2022-12-29
    ];
    $.info = {};
    for (let j = 0; j < activityList.length; j++) {
        if(activityList[j].end && Date.now() >activityList[j].end){
            console.log(`${activityList[j].name},结束`);
            await notify.sendNotify(`频道签到`, `签到：${activityList[j].name},已结束，请维护签到列表`);
            continue;
        }
        $.runaFlag = true;
        for (let i = 0; i < cookiesArr.length &&  $.runaFlag; i++) {
            UA = await getUA();
            if (cookiesArr[i]) {
                cookie = cookiesArr[i];
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                console.log(`\n*********京东账号${$.index} ${$.UserName}*********`);
                try {
                    await signRun(activityList[j]);
                }catch (e) {
                    $.runaFlag = false;
                    console.log(e)
                }
            }
        }
    }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();})

async function signRun(actInfo) {
    console.log(`\n执行签到：${actInfo.name}`);
    let thisHtml = '';
    let thisInfo =  {'url':actInfo.url};
    thisHtml = await getHtml(actInfo.url);
    if(thisHtml.match(/"encryptProjectId\\":\\"(.*?)\\"/) && thisHtml.match(/"encryptAssignmentId\\":\\"(.*?)\\"/)){
        actInfo.encryptProjectId = thisHtml.match(/"encryptProjectId\\":\\"(.*?)\\"/)[1] || '';
        actInfo.encryptAssigmentIds = thisHtml.match(/"encryptAssignmentId\\":\\"(.*?)\\"/)[1] || '';
    }
    if(!actInfo.encryptProjectId || !actInfo.encryptAssigmentIds){
        console.log(`初始化失败2`);
        return
    }
    let body = {
        "encryptProjectId":actInfo.encryptProjectId,
        "encryptAssigmentIds":[actInfo.encryptAssigmentIds],
        "ext":{
            "rewardEncryptAssignmentId":actInfo.encryptAssigmentIds,
            "timesEncryptAssignmentId":actInfo.encryptAssigmentIds,
            "needNum":50
        },
        "sourceCode":"aceaceqingzhan"
    };
    let mainInfo = await takeRequest('queryInteractiveInfo',body,thisInfo.url);
    if(mainInfo.msg === 'success'){
        console.log(`获取详情成功`);
    }else{
        console.log(`获取详情失败`);
        return ;
    }
    let assignmentList = mainInfo.assignmentList;
    for (let i = 0; i < assignmentList.length; i++) {
        let oneInfo = assignmentList[i];
        if(oneInfo.completionFlag){
            console.log(`已签到`);
        }else{
            await $.wait(3000);
            let ext = oneInfo.ext;
            let info = {
                "encryptProjectId":actInfo.encryptProjectId,
                "encryptAssignmentId":oneInfo.encryptAssignmentId,
                "completionFlag":true,
                "itemId":ext.sign1.itemId,
                "sourceCode":"aceaceqingzhan"
            }
            console.log(JSON.stringify(info))
            let signInfo = await takeRequest('doInteractiveAssignment',info,thisInfo.url);
            console.log(JSON.stringify(signInfo));
        }
    }
}
async function getHtml(url) {
    //let url = `https://pro.m.jd.com/mall/active/${id}/index.html`;
    let options ={
        url,
        headers: {
            Cookie: cookie,
            'User-Agent': 'JD4iPhone/167220 (iPhone; iOS 13.7; Scale/3.00)'
        }
    }
    return new Promise(resolve => {
        $.get(options, async (err, resp, data) => {
            try {
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data || {});
            }
        })
    })
}
async function takeRequest(functionID,bodyInfo,referer) {
    let url = `https://api.m.jd.com/client.action?functionId=${functionID}`;
    let body = `appid=babelh5&body=${encodeURIComponent(JSON.stringify(bodyInfo))}&sign=11&t=${Date.now()}`;
    let options = {
        url: url,
        body:body,
        headers: {
            "Origin": "https://pro.m.jd.com",
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
            'Cookie': cookie,
            "Referer": referer,
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN",
            "User-Agent": UA,
        }
    }
    return new Promise(resolve => {
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data || {});
            }
        })
    })
}
function getUA() {
    $.UUID = randomString(40)
    const buildMap = {
        "167814": `10.1.4`,
        "167841": `10.1.6`,
    }
    $.osVersion = `${randomNum(12, 14)}.${randomNum(0, 6)}`
    let network = `network/${['4g', '5g', 'wifi'][randomNum(0, 2)]}`
    $.mobile = `iPhone${randomNum(9, 13)},${randomNum(1, 3)}`
    $.build = ["167814","167841","167894"][randomNum(0,1)]
    $.appVersion = buildMap[$.build]
    return `jdapp;iPhone;${$.appVersion};${$.osVersion};${$.UUID};${network};model/${$.mobile};addressid/${randomNum(1e9)};appBuild/${$.build};jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS ${$.osVersion.replace(/\./g, "_")} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomNum(min, max) {
    if (arguments.length === 0) return Math.random()
    if (!max) max = 10 ** (Math.log(min) * Math.LOG10E + 1 | 0) - 1
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomString(min, max = 0) {
    var str = "", range = min, arr = [...Array(35).keys()].map(k => k.toString(36));

    if (max) {
        range = Math.floor(Math.random() * (max - min + 1) + min);
    }
    for (let i = 0; i < range;) {
        let randomString = Math.random().toString(16).substring(2)
        if ((range - i) > randomString.length) {
            str += randomString
            i += randomString.length
        } else {
            str += randomString.slice(i - range)
            i += randomString.length
        }
    }
    return str;
}
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
