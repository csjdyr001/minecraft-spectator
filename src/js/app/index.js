// Workaround for process.versions.node not existing in the browser
//process.versions.node = '14.0.0'

const mineflayer = require('mineflayer')
const { WorldView, Viewer } = require('prismarine-viewer/viewer')
global.THREE = require('three')
const JAVAprotocol = require('minecraft-protocol')
//const BEprotocol = require('bedrock-protocol')

function $(id) {
    return document.getElementById(id);
}

function getSelectValue(obj) {
    let index = obj.selectedIndex;
    return obj.options[index].value;
}

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

window.nodejs2JsMode = async function() {
    try {
        let data = {};
        data.ip = $("ip").value;
        data.port = $("port").value;
        data.password = $("pwd").value;
        data.username = $("un").value;
        data.type = getSelectValue($("serverType")); //java或bedrock
        data.auth = getSelectValue($("auth")); //mojang或microsoft
        if (data["type"] == "java") {
            showJavaServerInfo(data.ip, parseInt(data.port));
            const viewDistance = 6

            const bot = mineflayer.createBot({
                host: data["ip"], // minecraft 服务器的 IP 地址
                username: data["username"], // minecraft 用户名
                password: data["password"], // minecraft 密码, 如果你玩的是不需要正版验证的服务器，请注释掉。
                port: parseInt(data["port"]), // 默认使用 25565，如果你的服务器端口不是这个请取消注释并填写。
                // version: false,             // 如果需要指定使用一个版本或快照时，请取消注释并手动填写（如："1.8.9" 或 "1.16.5"），否则会自动设置。
                auth: data["auth"], // 如果需要使用微软账号登录时，请取消注释，然后将值设置为 'microsoft'，否则会自动设置为 'mojang'。
            })
            // 记录错误和被踢出服务器的原因:
            bot.on('kicked', (k) => {
                alert(k);
            })

            bot.on('error', (e) => {
                alert(e);
            })

            bot.on('end', () => {
                alert('disconnected')
            })

            bot.once('spawn', () => {
                alert('bot spawned - starting viewer')

                const version = bot.version

                const center = bot.entity.position

                const worldView = new WorldView(bot.world, viewDistance, center)

                // Create three.js context, add to page
                const renderer = new THREE.WebGLRenderer()
                renderer.setPixelRatio(window.devicePixelRatio || 1)
                renderer.setSize(window.innerWidth, window.innerHeight)
                $("playerView").appendChild(renderer.domElement)

                // Create viewer
                const viewer = new Viewer(renderer)
                if (!viewer.setVersion(version)) {
                    return false
                }

                worldView.listenToBot(bot)
                worldView.init(bot.entity.position)

                function botPosition() {
                    viewer.setFirstPersonCamera(bot.entity.position, bot.entity.yaw, bot.entity.pitch)
                    worldView.updatePosition(bot.entity.position)
                }

                bot.on('move', botPosition)

                // Link WorldView and Viewer
                viewer.listen(worldView)
                viewer.camera.position.set(center.x, center.y, center.z)

                function moveCallback(e) {
                    bot.entity.pitch -= e.movementY * 0.01
                    bot.entity.yaw -= e.movementX * 0.01
                    viewer.setFirstPersonCamera(null, bot.entity.yaw, bot.entity.pitch)
                }

                function changeCallback() {
                    if (document.pointerLockElement === renderer.domElement || document.mozPointerLockElement === renderer.domElement || document.webkitPointerLockElement === renderer.domElement) {
                        document.addEventListener('mousemove', moveCallback, false)
                    } else {
                        document.removeEventListener('mousemove', moveCallback, false)
                    }
                }
                document.addEventListener('pointerlockchange', changeCallback, false)
                document.addEventListener('mozpointerlockchange', changeCallback, false)
                document.addEventListener('webkitpointerlockchange', changeCallback, false)
                renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock || renderer.domElement.webkitRequestPointerLock
                document.addEventListener('mousedown', (e) => {
                    renderer.domElement.requestPointerLock()
                })

                document.addEventListener('contextmenu', (e) => e.preventDefault(), false)
                // Browser animation loop
                const animate = () => {
                    window.requestAnimationFrame(animate)
                    viewer.update()
                    renderer.render(viewer.scene, viewer.camera)
                }
                animate()
            })
        } else if (data["type"] == "bedrock") {
            alert("暂不支持bedrock版本");
        }
    } catch (e) {
        alert("发生错误：" + e.message);
    }
}