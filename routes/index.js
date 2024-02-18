var express = require('express');
const app = express();
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const bodyparser = require('body-parser');
const server = require('../bin/www');
const { Server } = require("socket.io");
var io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index');
});

app.use(bodyparser.urlencoded({extended:false}))
app.post('/spectator', (req, res) => {
  try{
    //if(socketA){
      const json = req.body;
      if(json["type"] == "java"){
      showJavaServerInfo(json.ip,parseInt(json.port));
      const bot = mineflayer.createBot({
        host: json["ip"], // minecraft 服务器的 IP 地址
        username: json["username"], // minecraft 用户名
        password: json["password"], // minecraft 密码, 如果你玩的是不需要正版验证的服务器，请注释掉。
        port: parseInt(json["port"]),                // 默认使用 25565，如果你的服务器端口不是这个请取消注释并填写。
        // version: false,             // 如果需要指定使用一个版本或快照时，请取消注释并手动填写（如："1.8.9" 或 "1.16.5"），否则会自动设置。
        auth: json["auth"],              // 如果需要使用微软账号登录时，请取消注释，然后将值设置为 'microsoft'，否则会自动设置为 'mojang'。
      })
      // 记录错误和被踢出服务器的原因:
      bot.on('kicked', (k) => {
        io.emit('message',k);
      })
      bot.on('error', (e) => {
        io.emit('message',e);
      })
      //实时显示
      bot.once('spawn', () => {
        mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port 是本地网页运行的端口 ，如果 firstPerson: false，那么将会显示鸟瞰图。
      })
      let succeedData = {};
      succeedData.succeed = true;
      succeedData.message = "http://127.0.0.1:3007";
      res.send(JSON.stringify(succeedData));
      }else if(json["type"] == "bedrock"){
        let failData2 = {};
        failData2.succeed = false;
        failData2.message = "暂不支持bedrock版本";
        res.send(JSON.stringify(failData2));
      }else{
        let failData3 = {};
        failData3.succeed = false;
        failData3.message = "未知的版本，请填写java或bedrock";
        res.send(JSON.stringify(failData3));
      }
    /*
    }else{
      let failData1 = {};
      failData1.succeed = false;
      failData1.message = "socket.io未连接";
      res.send(JSON.stringify(failData1));
    }
    */
  }catch(e){
    //console.log(e);
    let failData = {};
    failData.succeed = false;
    failData.message = e.message;
    res.send(JSON.stringify(failData));
  }
});

function showJavaServerInfo(ip, port) {
    JAVAprotocol.ping({ ip, port }, (err, pingResults) => { // Pinging server and getting result
        if (err) throw err
        //console.log(`${removeColorsFromString(JSON.stringify(pingResults.description.text))}`) // Printing motd to console
        $("serverInfo").innerHTML = `服务器名称：${JSON.stringify(pingResults.description.text)}<br>
        服务器类型：JAVA<br>
        服务器延迟：${JSON.stringify(pingResults.latency)} ms<br>
        服务器在线玩家：${JSON.stringify(pingResults.players.online)}/${JSON.stringify(pingResults.players.max)}<br>
        服务器版本：${JSON.stringify(pingResults.version.name)}.${JSON.stringify(pingResults.version.protocol)}
        `;
        //console.log(`${JSON.stringify(pingResults.latency)} ms | ${JSON.stringify(pingResults.players.online)}/${JSON.stringify(pingResults.players.max)} | ${JSON.stringify(removeColorsFromString(pingResults.version.name))}.${JSON.stringify(pingResults.version.protocol)}`)
    })
}

io.on("connection", (socket) => {
  console.log("connection");
});

module.exports = app;
