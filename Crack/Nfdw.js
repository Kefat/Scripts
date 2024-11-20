// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: bolt;
// Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy

/*
获取Token重写：https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_95598_token.sgmodule
使用方法：打开 南网在线APP 登录即可自动抓取/更新Token。

手动添加：
=========Quantumult-X=========
[MITM]
hostname = 95598.csg.cn
[rewrite_local]
^https:\/\/95598\.csg\.cn\/ucs\/ma\/zt\/eleCustNumber\/queryBindEleUsers url script-request-header https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/SouthernPower.js
============Surge=============
[Script]
南网在线Token = type=http-request,pattern=^https:\/\/95598\.csg\.cn\/ucs\/ma\/zt\/eleCustNumber\/queryBindEleUsers,requires-body=0,max-size=0,timeout=1000,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/SouthernPower.js,script-update-interval=0
[MITM]
hostname = %APPEND% 95598.csg.cn
*/

const notice = new Notification()
const timestamp = Date.parse(new Date());
const fileManager = FileManager.iCloud();
const folder = fileManager.joinPath(fileManager.documentsDirectory(), "electric");
const cacheFile = fileManager.joinPath(folder, 'data.json');
let boxjs_data, token;

try {
  boxjs_data = new Request('http://boxjs.com/query/data/token_95598');
  token = await boxjs_data.loadJSON();
} catch (e) {
  console.log(e)
}

if (token.val) {
  console.log(`boxjs_token 数据获取成功: ${token.val}`)
  data = { "token": `${token.val}`, "updateTime": `${timestamp}` }
} else if (fileManager.fileExists(cacheFile)) {
  // readString JSON
  data = fileManager.readString(cacheFile)
  data = JSON.parse(data)
} else {
  // 使用方法
  const loginAlert = new Alert();
  loginAlert.title = '南网在线登录';
  loginAlert.message = `\r\n注 : 南方电网只包括海南、广东、广西、云南、贵州。\n\n首次登录需用户自行在App中登录时抓包获取token，登录成功将储存在iCloud，token在抓包历史中找到https://95598.csg.cn/ucs/ma/zt/center/login，在响应头部拷贝x-auth-token的值\n\r\n小组件玩家: 95度茅台`;
  loginAlert.addAction('继续');
  loginAlert.addCancelAction('取消');
  login = await loginAlert.presentAlert();

  if (login === -1) {
    return;
  } else {
    const alert = new Alert();
    const token = Pasteboard.paste()
    alert.title = '输入token即可使用小组件';
    alert.message = '已获取剪贴板'
    alert.addTextField('输入token', token);
    alert.addAction('确定');
    alert.addCancelAction('取消');
    const input = await alert.presentAlert();
    const value = alert.textFieldValue(0)
    if (input === 0) {
      fileManager.createDirectory(folder)
      data = { "token": `${value}`, "updateTime": `${timestamp}` }
      data = JSON.stringify(data);
      fileManager.writeString(cacheFile, data);
      notice.title = '登录成功'
      notice.body = '重新运行即可预览或前往桌面添加小组件'
      notice.schedule()
    }
    return;
  }
}


// Get Year and Month
const Year = new Date().getFullYear();
const Month = new Date().getMonth() + 1;


// UserInfo
const req = new Request('https://95598.csg.cn/ucs/ma/zt/eleCustNumber/queryBindEleUsers');
req.method = 'POST'
req.headers = { "x-auth-token": `${data.token}` }
const res = await req.loadJSON();
const ele = res.data[0]
const name = ele.userName
const code = ele.areaCode
const id = ele.bindingId
const number = ele.eleCustNumber


// Yesterday
const yesterday = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryDayElectricByMPointYesterday');
yesterday.method = 'POST'
yesterday.headers = { "x-auth-token": `${data.token}`, "Content-Type": "application/json;charset=utf-8" }
yesterday.body = `{"areaCode": "${code}","eleCustId": "${id}"}`
const resY = await yesterday.loadJSON();
const Y = resY.data


// queryMeteringPoint
const point = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryMeteringPoint');
point.method = 'POST'
point.headers = { "x-auth-token": `${data.token}`, "Content-Type": "application/json;charset=utf-8" }
point.body = `{
  "areaCode" : "${code}",
  "eleCustNumberList" : [
    {
      "areaCode" : "${code}",
      "eleCustId" : "${id}"
    }
  ]
}`
const resP = await point.loadJSON();
const P = resP.data[0]


// Month
const month = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryDayElectricByMPoint');
month.method = 'POST'
month.headers = { "x-auth-token": `${data.token}`, "Content-Type": "application/json;charset=utf-8" }
month.body = `{
  "eleCustId" : "${id}",
  "areaCode" : "${code}",
  "yearMonth" : "${Year}${Month}",
  "meteringPointId" : "${P.meteringPointId}"
}`
const resM = await month.loadJSON();
const M = resM.data


// UserAccountNumberSurplus
const balance = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryUserAccountNumberSurplus');
balance.method = 'POST'
balance.headers = { "x-auth-token": `${data.token}`, "Content-Type": "application/json;charset=utf-8" }
balance.body = `{"areaCode": "${code}","eleCustId": "${id}"}`
const resB = await balance.loadJSON();
const B = resB.data[0]
const bal = B.balance


// selectElecBill
const elecBill = new Request('https://95598.csg.cn/ucs/ma/zt/charge/selectElecBill');
elecBill.method = 'POST'
elecBill.headers = { "x-auth-token": `${data.token}`, "Content-Type": "application/json;charset=utf-8" }
elecBill.body = `{
  "electricityBillYear" : "${Year}",
  "eleCustId" : "${id}",
  "areaCode" : "${code}"
}`
const resBill = await elecBill.loadJSON();
const pay = resBill.data.electricBillPay
const bill = resBill.data.billUserAndYear[0]
const total = bill.totalPower
const arrears = bill.arrears

const widget = await createWidget(ele, balance, pay);

if (config.widgetFamily === "small") {
  return;
}

if (config.runsInWidget) {
  Script.setWidget(widget)
  Script.complete()
} else {
  widget.presentMedium();
}


async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient()
  color = [
    "#CCCC99",
    "#757575",
    "#4FC3F7",
    "#99CCCC"
  ]
  const items = color[Math.floor(Math.random() * color.length)];
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(`${items}`, 0.5),
    new Color('#00000000')
  ]
  widget.backgroundGradient = gradient


  // Frame Layout
  const mainStack = widget.addStack();
  mainStack.layoutVertically();
  const dataStack = mainStack.addStack();
  dataStack.layoutHorizontally();

  // First column
  const column0 = dataStack.addStack();
  column0.layoutVertically();
  const logoStack = column0.addStack();
  logoStack.setPadding(0, 4, 0, 0);
  const ironMan = new Request('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/lightningMan.png');
  const iconSymbol = await ironMan.loadImage();
  const ironManIcon = logoStack.addImage(iconSymbol);
  ironManIcon.imageSize = new Size(80, 80);
  logoStack.url = 'alipays://platformapi/startapp?appId=2021001164644764'
  column0.addSpacer(5);

  // column nameRow
  const nameRow = column0.addStack();
  const nameStack = nameRow.addStack();
  nameStack.layoutHorizontally();
  nameStack.centerAlignContent();
  nameStack.setPadding(3, 10, 3, 10);
  // name icon
  const nameIcon = SFSymbol.named('person.crop.circle');
  const nameIconElement = nameStack.addImage(nameIcon.image);
  nameIconElement.imageSize = new Size(15, 15);
  nameIconElement.tintColor = Color.black();
  nameStack.addSpacer(8);
  // name text
  const nameText = nameStack.addText(name);
  nameText.font = Font.mediumSystemFont(14);
  nameText.textColor = Color.black();
  column0.addSpacer(3)

  // column payRow
  if (pay < 1) {
    const payRow = column0.addStack();
    const payStack = payRow.addStack();
    payStack.layoutHorizontally();
    payStack.centerAlignContent();
    payStack.backgroundColor = new Color('#EEEEEE', 0.1);
    payStack.setPadding(3, 10, 3, 10);
    payStack.cornerRadius = 10
    payStack.borderColor = Color.green();
    payStack.borderWidth = 3
    // pay bar icon
    const payIcon = SFSymbol.named('leaf.fill');
    const payIconElement = payStack.addImage(payIcon.image);
    payIconElement.imageSize = new Size(15, 15);
    payIconElement.tintColor = Color.green();
    payStack.addSpacer(8);
    // pay bar text
    const payText = payStack.addText('已缴费');
    payText.font = Font.mediumSystemFont(14);
    payText.textColor = new Color('#616161');
    column0.addSpacer(6)
  } else {
    const payRow = column0.addStack();
    const payStack = payRow.addStack();
    payStack.layoutHorizontally();
    payStack.centerAlignContent();
    payStack.backgroundColor = new Color('#EEEEEE', 0.1);
    payStack.setPadding(3, 10, 3, 10);
    payStack.cornerRadius = 10
    payStack.borderColor = new Color('#FF1744', 0.7);
    payStack.borderWidth = 2
    // pay bsr icon
    const payIcon = SFSymbol.named('leaf.fill');
    const payIconElement = payStack.addImage(payIcon.image);
    payIconElement.imageSize = new Size(15, 15);
    payIconElement.tintColor = Color.red();
    payStack.addSpacer(8);
    // pay bar text
    const payText = payStack.addText(pay);
    payText.font = Font.mediumSystemFont(14);
    payText.textColor = new Color('#D50000');
    column0.addSpacer(6)
  }


  // Second column
  const column2 = dataStack.addStack();
  column2.layoutVertically();
  column2.setPadding(5, 50, 0, 0)
  // yesterday
  const yesterdayRow = column2.addStack()
  const yesTDStack = yesterdayRow.addStack();
  yesTDStack.layoutHorizontally();
  yesTDStack.centerAlignContent();
  yesTDStack.setPadding(0, 0, 0, 0);
  // yesterday icon
  const yesterdayIcon = SFSymbol.named('bolt.fill');
  const yesterdayIconElement = yesTDStack.addImage(yesterdayIcon.image);
  yesterdayIconElement.imageSize = new Size(15, 15);
  yesterdayIconElement.tintColor = Color.red();
  yesTDStack.addSpacer(6);
  // yesterday text
  const yesterdayText = yesTDStack.addText('昨日');
  yesterdayText.font = Font.mediumSystemFont(14)
  yesterdayText.textColor = new Color('#616161');
  column2.addSpacer(3)
  // Yesterday Use text
  const yesterdayUseText = column2.addText(`${Y.power}度`)
  yesterdayUseText.textColor = Color.blue();
  yesterdayUseText.font = Font.boldSystemFont(14)
  yesterdayUseText.leftAlignText()
  column2.addSpacer(10)


  // Electricity used this month
  const monthRow = column2.addStack()
  const monthStack = monthRow.addStack();
  monthStack.layoutHorizontally();
  monthStack.centerAlignContent();
  monthStack.setPadding(0, 0, 0, 0);
  // month icon
  const monthIcon = SFSymbol.named('bolt.fill');
  const monthIconElement = monthStack.addImage(monthIcon.image);
  monthIconElement.imageSize = new Size(15, 15);
  monthIconElement.tintColor = Color.purple();
  monthStack.addSpacer(6);
  // month text
  const monthText = monthStack.addText('本月');
  monthText.font = Font.mediumSystemFont(14)
  monthText.textColor = new Color('#616161');
  column2.addSpacer(3)
  // month Use Text
  const monthUseText = column2.addText(`${M.totalPower}度`)
  monthUseText.textColor = Color.blue();
  monthUseText.font = Font.boldSystemFont(14)
  monthUseText.leftAlignText()
  column2.addSpacer(10)


  // User balance
  const balanceRow = column2.addStack()
  const balStack = balanceRow.addStack();
  balStack.layoutHorizontally();
  balStack.centerAlignContent();
  balStack.setPadding(0, 0, 0, 0);
  // balance Icon
  const balanceIcon = SFSymbol.named('star.fill');
  const balanceIconElement = balStack.addImage(balanceIcon.image);
  balanceIconElement.imageSize = new Size(15, 15);
  balanceIconElement.tintColor = Color.green();
  balStack.addSpacer(6);
  // balance text
  const balanceText = balStack.addText('余额');
  balanceText.font = Font.mediumSystemFont(14)
  balanceText.textColor = new Color('#616161');
  column2.addSpacer(3)
  //balance Use Text
  const contain = bal.indexOf(".") != -1
  if (contain === false) {
    balanceUseText = column2.addText(`${B.balance}.00 元`)
  } else {
    balanceUseText = column2.addText(`${B.balance} 元`)
  }
  balanceUseText.textColor = Color.blue();
  balanceUseText.font = Font.boldSystemFont(14)
  balanceUseText.leftAlignText()
  column2.addSpacer(5)


  //Third column
  const column3 = dataStack.addStack();
  column3.layoutVertically();
  column3.setPadding(5, 30, 0, 0)
  // Use ele
  const useEleRow = column3.addStack()
  const useEleStack = useEleRow.addStack();
  useEleStack.layoutHorizontally();
  useEleStack.centerAlignContent();
  useEleStack.setPadding(0, 0, 0, 0);
  // Use ele icon
  const useEleIcon = SFSymbol.named('lightbulb.fill');
  const useEleIconElement = useEleStack.addImage(useEleIcon.image);
  useEleIconElement.imageSize = new Size(15, 15);
  useEleIconElement.tintColor = Color.orange();
  useEleStack.addSpacer(6);
  // Use ele text
  const useEleText = useEleStack.addText('上月');
  useEleText.font = Font.mediumSystemFont(14);
  useEleText.textColor = new Color('#616161');
  column3.addSpacer(3)
  // Use ele total text
  const useEleTotalText = column3.addText(`${total}`)
  useEleTotalText.textColor = Color.blue();
  useEleTotalText.font = Font.boldSystemFont(14)
  useEleTotalText.leftAlignText()
  column3.addSpacer(10)


  // Electricity Charge
  const eleBillRow = column3.addStack()
  const eleBiStack = eleBillRow.addStack();
  eleBiStack.layoutHorizontally();
  eleBiStack.centerAlignContent();
  eleBiStack.setPadding(0, 0, 0, 0);
  // eleBill icon
  const eleBillIcon = SFSymbol.named('yensign.circle');
  const eleBillIconElement = eleBiStack.addImage(eleBillIcon.image);
  eleBillIconElement.imageSize = new Size(15, 15);
  eleBillIconElement.tintColor = Color.purple();
  eleBiStack.addSpacer(6);
  // eleBill text
  const eleBillText = eleBiStack.addText('电费');
  eleBillText.font = Font.mediumSystemFont(14);
  eleBillText.textColor = new Color('#616161');
  column3.addSpacer(3)
  // ele Bill Total Text
  const eleBillTotalText = column3.addText(`${arrears} 元`)
  eleBillTotalText.textColor = Color.blue();
  eleBillTotalText.font = Font.boldSystemFont(14)
  eleBillTotalText.leftAlignText()
  column3.addSpacer(10)


  // Waiting for payment
  const arrearsRow = column3.addStack()
  const arrearsStack = arrearsRow.addStack();
  arrearsStack.layoutHorizontally();
  arrearsStack.centerAlignContent();
  arrearsStack.setPadding(0, 0, 0, 0);
  // arrears icon
  const arrearsIcon = SFSymbol.named('exclamationmark.shield');
  const arrearsIconElement = arrearsStack.addImage(arrearsIcon.image);
  arrearsIconElement.imageSize = new Size(15, 15);
  arrearsIconElement.tintColor = Color.red();
  arrearsStack.addSpacer(6);
  // arrears text
  const arrearsText = arrearsStack.addText('待缴');
  arrearsText.font = Font.mediumSystemFont(14);
  arrearsText.textColor = new Color('#616161');
  column3.addSpacer(3)
  // arrears total text
  const arrearsTotalText = column3.addText(`${pay} 元`);
  arrearsTotalText.textColor = Color.blue();
  arrearsTotalText.font = Font.boldSystemFont(14)
  arrearsTotalText.leftAlignText()
  column3.addSpacer(5)

  return widget;
}


// 计算时长
const pushTime = (timestamp - data.updateTime);
const P1 = pushTime % (24 * 3600 * 1000);
const hours = Math.floor(P1 / (3600 * 1000));

if (hours >= 12) {
  if (pay > 0) {
    //Notification_1
    notice.sound = 'alert'
    notice.title = '用电缴费通知‼️'
    notice.body = `${name}` + `，户号 ${number}` + `\n上月用电 ${total} 度 ，待缴电费 ${pay} 元`
    notice.schedule()

    // writeString JSON
    if (fileManager.fileExists(folder)) {
      data = { "token": `${data.token}`, "updateTime": `${timestamp}` }
      data = JSON.stringify(data);
      fileManager.writeString(cacheFile, data);
    }
  }
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}


async function shadowImage(img) {
  let ctx = new DrawContext()
  ctx.size = img.size
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 图片遮罩颜色、透明度设置
  ctx.setFillColor(new Color("#000000", 0.3))
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
  let res = await ctx.getImage()
  return res
}
