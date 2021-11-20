const request = require('request');
const path = require('path');
const atob = require("atob");
const btoa = require("btoa");
const fs = require("fs");
const https = require("https");
const AdmZip = require('adm-zip');

const cache = new Map();

const homedir = require('os').homedir();
let IFFMCDir = path.join(__dirname, '/data');

if (!fs.existsSync(IFFMCDir)) {
    fs.mkdirSync(IFFMCDir);
    resetData()
}

const out = fs.createWriteStream(IFFMCDir + "/data.zip");

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
    if(cache.has(name)){
        resolve(cache.get(name));
    }else{
            if (fs.existsSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport))) {
                if(fs.existsSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/SID', '/', name.split('.')[0]))){
                    const data = JSON.parse(fs.readFileSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/SID', '/', name.split('.')[0])))
                    resolve({
                        waypoints: data.transitions[name.split('.')[1]],
                        name: name.split('.')[1],
                        fullName: name,
                        runways: data.runways
                    })
                }else{
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        }
    });
}
async function getSIDS(airport){
    return new Promise((resolve, reject) =>{
        if(fs.existsSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport))){
            fs.readdir(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/SID'), (err, files) => {
                let counter = 0;
                let map = new Map();
                files.forEach(file => {
                    const data = JSON.parse(fs.readFileSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/SID/', file), 'utf8'));
                    console.log(data)
                    Object.keys(data.transitions).forEach(type =>{
                        const source = data.transitions[type];
                        map.set(`${file.slice(0, -5)}.${type}`, {
                           waypoints: source,
                           name: type,
                           fullName: `${file.slice(0, -5)}.${type}`,
                           runways: data.runways
                        })
                        cache.set(`${file.slice(0, -5)}.${type}`, {
                            waypoints: source,
                            name: type,
                            fullName: `${file.slice(0, -5)}.${type}`,
                            runways: data.runways
                        })
                    });
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
    if (cache.has(name)) {
        resolve(cache.get(name));
    } else {
            if (fs.existsSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport))) {
                if (fs.existsSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/STAR', '/', name.split('.')[0]))) {
                    const data = JSON.parse(fs.readFileSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/STAR', '/', name.split('.')[0])))
                    resolve({
                        waypoints: data.transitions[name.split('.')[1]],
                        name: name.split('.')[1],
                        fullName: name,
                        runways: data.runways
                    })
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        }
    });
}
function getSTARS(airport){
    return new Promise((resolve, reject) => {
        if (fs.existsSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport))) {
            fs.readdir(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/STAR'), (err, files) => {
                let counter = 0;
                let map = new Map();
                files.forEach(file => {
                    const data = JSON.parse(fs.readFileSync(path.join(IFFMCDir, '/IFFMC-Data-Master/airports', '/', airport, '/STAR/', file), 'utf8'));
                    console.log(data)
                    Object.keys(data.transitions).forEach(type => {
                        const source = data.transitions[type];
                        map.set(`${file.slice(0, -5)}.${type}`, {
                            waypoints: source,
                            name: type,
                            fullName: `${file.slice(0, -5)}.${type}`,
                            runways: data.runways
                        })
                        cache.set(`${file.slice(0, -5)}.${type}`, {
                            waypoints: source,
                            name: type,
                            fullName: `${file.slice(0, -5)}.${type}`,
                            runways: data.runways
                        })
                    });
                });
                resolve(map);
            });
        } else {
            resolve(false);
        }
    });
}

async function resetData(cb){
    alert("Resetting data...")
    var req = request(
        {
            method: 'GET',
            uri: 'https://github.com/Sam-Neale/IFFMC-Data/archive/refs/heads/master.zip',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11",
                "Referer": "http://www.nseindia.com/products/content/all_daily_reports.htm",
                "Accept-Encoding": "gzip,deflate,sdch",
                "encoding": "null",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Cookie": "cookie"
            }
        }
    );
    req.pipe(out);
    req.on('end', function () {
        var zip = new AdmZip(IFFMCDir + "/data.zip"),
            zipEntries = zip.getEntries();
        zip.extractAllTo(IFFMCDir, /*overwrite*/true);
        cache.clear();
        alert("Data reset")
        cb();
    });
}

module.exports = {
    getRoute,
    SIDS: {get: getSID, getAll: getSIDS},
    STARS: { get: getSTAR, getAll: getSTARS },
    newData: resetData
}