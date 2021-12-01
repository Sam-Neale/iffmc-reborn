const request = require('request');
const path = require('path');
const atob = require("atob");
const btoa = require("btoa");
const fs = require("fs");
const https = require("https");
const AdmZip = require('adm-zip');
const prompt = require('electron-prompt');
const cache = new Map();
const { BrowserWindow } = require('@electron/remote');

const homedir = require('os').homedir();
let IFFMCDir = path.join(__dirname, '/data');

if (!fs.existsSync(IFFMCDir)) {
    fs.mkdirSync(IFFMCDir);
    resetData()
}

function getRoute(name){
    return new Promise(function(resolve, reject){
        const options = {
            method: 'GET',
            url: `https://raw.githubusercontent.com/Sam-Neale/IFFMC-Routes/master/routes/${name}.json`

        };
        request(options, function (errorNET, response, body) {
            if (errorNET) reject(errorNET);
            if (response.statusCode == 200) {
                const route = JSON.parse(body);
                resolve([true, route.fixArray]);
            } else if (response.statusCode == 404) {
                resolve([false, 404]);
            } else {
                resolve([false, 0, body]);
            }

        });
    })
}

function getSID(name, airport){
    return new Promise((resolve, reject) => {
        if (fs.existsSync(path.join(IFFMCDir, "/", airport, "/SID/", `${name}.json`))){
            const SID = JSON.parse(fs.readFileSync(path.join(IFFMCDir, "/",airport,"/SID/",`${name}.json`)));
            console.log(SID);
            resolve({
                name: SID.name,
                runways: SID.runways,
                waypoints: SID.fixes
            })
        }else{
            resolve(false);
        }
    })
}

async function getSIDS(airport){
    console.log(path.join(IFFMCDir, '/', airport, '/SID'))
    return new Promise((resolve, reject) =>{
        if(fs.existsSync(path.join(IFFMCDir, '/', airport))){
            fs.readdir(path.join(IFFMCDir, '/', airport, '/SID'), (err, files) => {
                let counter = 0;
                let map = new Map();
                files.forEach(file => {
                    const data = JSON.parse(fs.readFileSync(path.join(IFFMCDir, '/', airport, '/SID/', file), 'utf8'));
                    const source = data.fixes;
                    const name = data.name;
                    map.set(name, {
                        waypoints: source,
                        name: name,
                        runways: data.runways
                    })
                    cache.set(name, {
                        waypoints: source,
                        name: name,
                        runways: data.runways
                    })
                });
                resolve(map);
            });
        }else{
            resolve(false);
        }
    });
}

function getSTAR(name, airport){
    return new Promise((resolve, reject) => {
        if(fs.existsSync(path.join(IFFMCDir, "/",airport,"/STAR/",`${name}.json`))){
            const STAR = JSON.parse(fs.readFileSync(path.join(IFFMCDir, "/", airport, "/STAR/", `${name}.json`)));
            resolve({
                name: STAR.name,
                runways: STAR.runways,
                waypoints: STAR.fixes
            })
        }else{
            resolve(false);
        }
    })
}
function getSTARS(airport){
    console.log(path.join(IFFMCDir, '/', airport, '/STAR'))
    return new Promise((resolve, reject) => {
        if (fs.existsSync(path.join(IFFMCDir, '/', airport))) {
            fs.readdir(path.join(IFFMCDir, '/', airport, '/STAR'), (err, files) => {
                let counter = 0;
                let map = new Map();
                files.forEach(file => {
                    const data = JSON.parse(fs.readFileSync(path.join(IFFMCDir, '/', airport, '/STAR/', file), 'utf8'));
                    const source = data.fixes;
                    const name = data.name;
                    map.set(name, {
                        waypoints: source,
                        name: name,
                        runways: data.runways
                    })
                    cache.set(name, {
                        waypoints: source,
                        name: name,
                        runways: data.runways
                    })
                });
                resolve(map);
            });
        } else {
            resolve(false);
        }
    });
}

async function resetData(cb){
    if(credentials.token){
        alert("Resetting data...")
        var req = request(
            {
                method: 'GET',
                url: 'http://144.138.103.239:6400/data',
                headers: {
                    Authorization: `Bearer ${credentials.token}`
                }
            }
        );
        const out = fs.createWriteStream(IFFMCDir + "/data.zip");
        req.pipe(out);
        req.on('end', function () {
            var zip = new AdmZip(IFFMCDir + "/data.zip"),
                zipEntries = zip.getEntries();
            zip.extractAllTo(IFFMCDir, /*overwrite*/true);
            cache.clear();
            alert("Data reset")
            cb();
        });
    }else{
        let returningCb = cb;
        login((state) =>{
            if(state){
                resetData(returningCb);
            }else{
                alert("Unable to reset data");
            }
        })
    }
}

async function login(cb){
    prompt({
        title: 'Login to IFFMC',
        label: 'Username:',
        value: '',
        inputAttrs: {
            type: 'text'
        },
        type: 'input'
    }).then((r) => {
            if (r === null) {
                cb(false);
            } else {
                credentials.username = r;
                prompt({
                    title: 'Login to IFFMC',
                    label: 'Password:',
                    value: '',
                    inputAttrs: {
                        type: 'password'
                    },
                    type: 'input'
                }).then((r) => {
                    if (r === null) {
                        cb(false);
                    } else {
                        credentials.password = r;
                        request({
                            method: 'POST',
                            url: 'http://144.138.103.239:6400/login',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            form: { username: credentials.username, password: credentials.password }
                        }, function (error, response, body) {
                            if (error) throw new Error(error);
                            if(response.statusCode == 200){
                                credentials.token = body;
                                cb(true);
                            }else{
                                alert(`Unable to login`)
                            }
                        });
                    }
                })
            }
    })
}

let credentials = {
    username: "",
    password: "",
    token: ""
}

module.exports = {
    getRoute,
    SIDS: {get: getSID, getAll: getSIDS},
    STARS: { get: getSTAR, getAll: getSTARS },
    newData: resetData,
    logon: login
}