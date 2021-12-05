//@ts-check
//Requirements
const request = require('request');
const IFC = require('ifc-evolved');
const IFFMCData = require("./IFFMCData.js");
const { BrowserWindow } = require('@electron/remote');

//Globals
let debug = true;
let SPInput = "";
let SPState = "AI";
let SPComp = "";
let currentErrorVar = false;
let keyboardEnabled = false;
let safeIntervals = 100;
let currentIntervals = 0;

/*@type {style}*/
const SPStyle = {
    color: "FFFFFF",
    weight: "normal",
    fontSize: "30px",
    fontFamily: "Roboto Mono",
    align: "left"
}

/**
 * A style
 * @typedef {Object} style
 * @property {string} [color]
 * @property {string} [weight]
 * @property {string} [fontSize]
 * @property {string} [fontFamily]
 * @property {string} [align]
 */

/**
 * A sidebuttons side
 * @typedef {Object} sideButtons
 * @property {function} [button1]
 * @property {function} [button2]
 * @property {function} [button3]
 * @property {function} [button4]
 * @property {function} [button5]
 * @property {function} [button6]
 */


async function logConsole(message) {
    if(debug){
        console.log(message);
    }
}
async function errorConsole(message) {
    if (debug) {
        console.error(message);
    }
}
async function warnConsole(message) {
    if (debug) {
        console.warn(message);
    }
}
async function error(message, timeout){
    if(timeout){
        SPState = "CE";
        SPComp = message;
        setTimeout(() => {
            SPState = "AI";
            SPComp = "";
        }, timeout);
    }else if(currentErrorVar){
        let checker = setInterval(() => {
            if(currentErrorVar == true){
                SPState = "CE";
                SPComp = message;
            }else{
                SPState = "AI";
                SPComp = "";
                clearInterval(checker);
            }
        }, 100);
    }
}
async function warn(message, timeout) {
    if (timeout) {
        SPState = "CW";
        SPComp = message;
        setTimeout(() => {
            SPState = "AI";
            SPComp = "";
        }, timeout);
    } else if (currentErrorVar) {
        let checker = setInterval(() => {
            if (currentErrorVar == true) {
                SPState = "CW";
                SPComp = message;
            } else {
                SPState = "AI";
                SPComp = "";
                clearInterval(checker);
            }
        }, 100);
    }
}
let buttonActions = {
    sideButtons:{
        /** @type sideButtons */
        left: {
            button1: function(){
                logConsole("Button Clicked")
            },
            button2: function () {
                logConsole("Button Clicked")
            },
            button3: function () {
                logConsole("Button Clicked")
            },
            button4: function () {
                logConsole("Button Clicked")
            },
            button5: function () {
                logConsole("Button Clicked")
            },
            button6: function () {
                logConsole("Button Clicked")
            }
        },
        /** @type sideButtons */
        right: {
            button1: function () {
                logConsole("Button Clicked")
            },
            button2: function () {
                logConsole("Button Clicked")
            },
            button3: function () {
                logConsole("Button Clicked")
            },
            button4: function () {
                logConsole("Button Clicked")
            },
            button5: function () {
                logConsole("Button Clicked")
            },
            button6: function () {
                logConsole("Button Clicked")
            }
        }
    },
    INITREF: function () {
        currentProgram = "INIT_REF"
        programs[currentProgram].onLoad();
    },
    RTE: function (){
        currentProgram = "RTE"
        programs[currentProgram].onLoad();
    },
    DEPARR: function (){
        currentProgram = "DEPARR"
        programs[currentProgram].onLoad();
    },
    NPage: function(){
        let program = programs[currentProgram];
        program.onPageChange("UP");
    },
    PPage: function () {
        let program = programs[currentProgram];
        program.onPageChange("DOWN");
    }
}

//Audio
var playing = {};
var sounds = { click: "click.mp3" };
function player(x) {
    var a, b;
    b = new Date();
    a = x + b.getTime();
    playing[a] = new Audio(sounds[x]);
    // with this we prevent playing-object from becoming a memory-monster:
    playing[a].onended = function () { delete playing[a] };
    playing[a].play();
}

//Buttons
async function buttonClick(type, value){
    //Play sound
    player('click');
    logConsole([type,value]);
    switch(type){
        case "function":
            if (buttonActions[value]){
                buttonActions[value]();
            }else{
                error("FUNCTION NOT FOUND", 2500)
            }
            
            break;
        case "function-left":
            if (buttonActions.sideButtons.left[`button${value + 1}`]){
                buttonActions.sideButtons.left[`button${value + 1}`]();
            }
            break;
        case "function-right":
            if (buttonActions.sideButtons.right[`button${value + 1}`]) {
                buttonActions.sideButtons.right[`button${value + 1}`]();
            }
            break;
        case "num":
            SPState = "AI";
            SPComp = "";
            currentErrorVar = false;
            if(value == "INVERT"){
                let numbers = parseInt(SPInput);
                if(isNaN(numbers) == false){
                    SPInput = (numbers * -1).toString();
                }else{
                    warn("Not a number", 1000)
                }
            }else{
                SPInput += value;
            }
            break;
        case "char":
            SPState = "AI";
            SPComp = "";
            currentErrorVar = false;
            if(value == "DEL"){
                SPInput = SPInput.slice(0, -1);
            }else if(value == "CLR"){
                SPInput = "";
            }else if(value == "SP"){
                SPInput += " ";
            }else{
                SPInput += value;
            }
            break;
        default:
            warnConsole(["Missing type declaration", type]);
            break;
    }
}

//Programs
let currentProgram = "INIT_REF";
let programs = {
    INIT_REF: {
        onLoad: function () {
            programs.INIT_REF.data.pages.set('page0', {
                num: 0,
                data: {}
            })
            //Set Sidebuttons
            buttonActions.sideButtons.right.button3 = function () {
                if (keyboardEnabled == true) {
                    keyboardEnabled = false;
                } else {
                    keyboardEnabled = true;
                }
            }
        },
        onPageChange: function (type) {
            let program = programs.INIT_REF;
            if (type == "UP") {
                if (program.data.pages.has(`page${program.data.pageNum + 1}`)) {
                    program.data.pageNum++;
                } else {
                    error("NO PAGE FOUND", 1000)
                }
            } else {
                if (program.data.pages.has(`page${program.data.pageNum - 1}`)) {
                    program.data.pageNum--;
                } else {
                    error("NO PAGE FOUND", 1000)
                }
            }
        },
        data: {
            pageNum: 0,
            pages: new Map()
        },
        constant: function (page) {
            //Program title
            renderText("IDENT", [500, 65], { fontSize: "50px", weight: "bold", align: "center"})
            //Data
            if(IFData.connected == true){
                    //Connection Status
                        //Header
                        renderText("Connection", [15, 110], {fontSize: "25px", weight: "bold"})
                        //Value
                        renderText("Connected", [15, 160], {fontSize: "35px"})
                    //Version
                        //Header
                        renderText("Version", [985, 110], {fontSize: "25px", weight: "bold", align: "right"});
                        //Value
                        renderText(IFData.version, [985, 160], {fontSize: "35px", align: "right"});
                    //Device
                        //Header
                        renderText("Device", [985, 215], {fontSize: "25px", weight: "bold", align: "right"});
                        //Value
                        renderText(IFData.device, [985, 265], {fontSize: "35px", align: "right"});
                    let aircraftExists = IFData.vehicle.model != "Unknown";
                    //Aircraft
                        //Header
                        renderText("Aircraft", [15, 215], {fontSize: "25px", weight: "bold"})
                        //Value
                        renderText(IFData.vehicle.model, [15, 265], {fontSize: "35px", color: aircraftExists ? "FFFFFF" : "FFA500"})
                    //Livery
                        //Header
                        renderText("Livery", [15, 320], {fontSize: "25px", weight: "bold"})
                        //Value
                        renderText(IFData.vehicle.livery, [15, 370], { fontSize: "35px", color: aircraftExists ? "FFFFFF" : "FFA500"})
                    //Reset FMC
                        if(!aircraftExists){
                            displayCTX.font = "bold 35px Courier New";
                            displayCTX.fillText("Restart FMC", 15, 475);
                            buttonActions.sideButtons.left.button4 = function () { window.location.reload() };
                        }
                        
                    //Keyboard
                        //Header
                        renderText("Keyboard", [985, 320], {fontSize: "25px", weight: "bold", align: "right"});
                        //Value
                        renderText(keyboardEnabled ? "Enabled" : "Disabled", [985, 370], {fontSize: "35px", align: "right"});
                }else if(IFData.connected == false){
                    //Connection Status
                        //Header
                        renderText("Connection", [15, 110], {fontSize: "25px", weight: "bold"})
                        //Value
                        renderText("Looking", [15, 160], {fontSize: "35px"})
                }else{
                    //Connection Status
                        //Header
                        renderText("Connection", [15, 110], {fontSize: "25px", weight: "bold"})
                        //Value
                        renderText("Failed", [15, 160], {fontSize: "35px", color: "FF1111"})
                    //RELOAD
                    displayCTX.font = "bold 35px Courier New";
                    displayCTX.fillText("Restart FMC", 15, 265);
                    buttonActions.sideButtons.left.button2 = function () {window.location.reload()};
                }
        }
    },
    RTE: {
        onLoad: function () {
            let program = programs.RTE;
            
            programs.RTE.data.pages.set('page0', {
                num: 0,
                data: {
                    sbLayout: {
                        left: {
                            button1: function () {
                                if(SPInput == ""){
                                    SPInput = IFData.route.origin.code;
                                    IFData.route.origin.code = "";
                                }else{
                                    IFData.route.origin.code = SPInput;
                                    SPInput = "";
                                }
                            }
                        },
                        right: {
                            button1: function () {
                                if (SPInput == "") {
                                    SPInput = IFData.route.destination.code;
                                    IFData.route.destination.code = "";
                                } else {
                                    IFData.route.destination.code = SPInput;
                                    SPInput = "";
                                }
                            },
                            button2: function () {
                                if (SPInput == "") {
                                    SPInput = IFData.route.DBRoute;
                                    IFData.route.DBRoute = "";
                                    IFData.route.fixes = [];
                                    warn("Unloaded FPLN", 2500)
                                } else {
                                    IFData.route.DBRoute = SPInput;
                                    SPInput = "";
                                    currentErrorVar = true;
                                    warn('Getting FPLN');
                                    IFFMCData.getRoute(IFData.route.DBRoute).then(result =>{
                                        if(result[0] == true){
                                            IFData.route.fixes = result[1];
                                            currentErrorVar = false;
                                            warn("FPLN Loaded", 2500);
                                            let pagesRequired = Math.floor(IFData.route.fixes.length / 5) + 1;
                                            let currentPages = program.data.pages.size - 1;
                                            currentIntervals = 0;
                                            let pageChecker = setInterval(() =>{
                                                
                                                currentIntervals++;
                                                if(pagesRequired > currentPages && currentIntervals <= safeIntervals){
                                                    program.data.pages.set(`page${currentPages + 1}`, {
                                                        num: currentPages + 1,
                                                        data: {
                                                            sbLayout: {
                                                                left: {},
                                                                right: {
                                                                    button1: function () {
                                                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                                                        let integer = 0;
                                                                        if (SPInput != "") {
                                                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                                                            SPInput = "";
                                                                        } else {
                                                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                                                        }
                                                                    },
                                                                    button2: function () {
                                                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                                                        let integer = 1;
                                                                        if (SPInput != "") {
                                                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                                                            SPInput = "";
                                                                        } else {
                                                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                                                        }
                                                                    },
                                                                    button3: function () {
                                                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                                                        let integer = 2;
                                                                        if (SPInput != "") {
                                                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                                                            SPInput = "";
                                                                        } else {
                                                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                                                        }
                                                                    },
                                                                    button4: function () {
                                                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                                                        let integer = 3;
                                                                        if (SPInput != "") {
                                                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                                                            SPInput = "";
                                                                        } else {
                                                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                                                        }
                                                                    },
                                                                    button5: function () {
                                                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                                                        let integer = 4;
                                                                        if (SPInput != "") {
                                                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                                                            SPInput = "";
                                                                        } else {
                                                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            routePlus: currentPages * 5
                                                        }
                                                    })
                                                    currentPages = program.data.pages.size - 1;
                                                }else if(pagesRequired < currentPages){
                                                    currentPages = program.data.pages.size - 1;
                                                    program.data.pages.delete(`page${currentPages}`);
                                                }else{
                                                    clearInterval(pageChecker)
                                                }
                                            }, 25);
                                        }else{
                                            if(result[1] == 404){
                                                currentErrorVar = false;
                                                setTimeout(() => {
                                                    error("FPLN UNAVILABLE", 2500);
                                                    SPInput = IFData.route.DBRoute;
                                                    IFData.route.DBRoute = "";
                                                    IFData.route.fixes = [];
                                                }, 100);
                                            }else{
                                                currentErrorVar = false;
                                                error("FPLN UNAVILABLE", 2500);
                                                SPInput = IFData.route.DBRoute;
                                                IFData.route.DBRoute = "";
                                                IFData.route.fixes = [];
                                                console.error(result[2]);
                                            }
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
            });
            programs.RTE.data.pages.set('page1', {
                num: 1,
                data: {
                    sbLayout: {
                        left: {},
                        right: {
                            button1: function () {
                                let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                let integer = 0;
                                if(SPInput != ""){
                                    IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                    SPInput = "";
                                }else{
                                    SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                    IFData.route.fixes[page.data.routePlus + integer] = "";
                                }
                            },
                            button2: function () {
                                let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                let integer = 1;
                                if (SPInput != "") {
                                    IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                    SPInput = "";
                                } else {
                                    SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                    IFData.route.fixes[page.data.routePlus + integer] = "";
                                }
                            },
                            button3: function () {
                                let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                let integer = 2;
                                if (SPInput != "") {
                                    IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                    SPInput = "";
                                } else {
                                    SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                    IFData.route.fixes[page.data.routePlus + integer] = "";
                                }
                            },
                            button4: function () {
                                let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                let integer = 3;
                                if (SPInput != "") {
                                    IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                    SPInput = "";
                                } else {
                                    SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                    IFData.route.fixes[page.data.routePlus + integer] = "";
                                }
                            },
                            button5: function () {
                                let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                let integer = 4;
                                if (SPInput != "") {
                                    IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                    SPInput = "";
                                } else {
                                    SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                    IFData.route.fixes[page.data.routePlus + integer] = "";
                                }
                            }
                        }
                    },
                    routePlus: 0
                }
            })
            let pagesRequired = Math.floor(IFData.route.fixes.length / 5) + 1;
            let currentPages = program.data.pages.size - 1;
            currentIntervals = 0;
            let pageChecker = setInterval(() => {
                
                currentIntervals++;
                if (pagesRequired > currentPages && currentIntervals <= safeIntervals) {
                    program.data.pages.set(`page${currentPages + 1}`, {
                        num: currentPages + 1,
                        data: {
                            sbLayout: {
                                left: {},
                                right: {
                                    button1: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 0;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button2: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 1;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button3: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 2;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button4: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 3;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button5: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 4;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    }
                                }
                            },
                            routePlus: currentPages * 5
                        }
                    })
                    currentPages = program.data.pages.size - 1;
                }else if (pagesRequired < currentPages) {
                    currentPages = program.data.pages.size - 1;
                    program.data.pages.delete(`page${currentPages}`);
                }else{
                    clearInterval(pageChecker)
                }
            }, 25);
            let npage = program.data.pages.get(`page${program.data.pageNum}`);
            if (npage.data.sbLayout) {
                buttonActions.sideButtons = npage.data.sbLayout;
            }
        },
        onPageChange: function (type) {
            let program = programs.RTE;
            if(type == "UP"){
                if(program.data.pages.has(`page${program.data.pageNum + 1}`)){
                    program.data.pageNum++;
                    let npage = program.data.pages.get(`page${program.data.pageNum}`);
                    if(npage.data.sbLayout){
                        buttonActions.sideButtons = npage.data.sbLayout;
                    }
                }else{
                    error("NO PAGE FOUND", 1000)
                }
            }else{
                if (program.data.pages.has(`page${program.data.pageNum - 1}`)){
                    program.data.pageNum--;
                    let npage = program.data.pages.get(`page${program.data.pageNum}`);
                    if (npage.data.sbLayout) {
                        buttonActions.sideButtons = npage.data.sbLayout;
                    }
                }else{
                    error("NO PAGE FOUND", 1000)
                }
            }
        },
        data: {
            pageNum: 0,
            pages: new Map()
        },
        constant: function () {
            let program = programs.RTE;
            //Program title
            renderText("ROUTE", [500, 65], { fontSize: "50px", weight: "bold", align: "center" })
            buttonActions.EXEC = async function () {
                if(currentProgram == "RTE"){
                    IFC.sendCommand({
                        "Command": "Commands.FlightPlan.Clear",
                        "Parameters": []
                    })
                    /*IFC.sendCommand({
                        "Command": "Commands.FlightPlan.AddWaypoints",
                        "Parameters": [{ "Name": "WPT", "Value": IFData.route.origin}]
                    });*/
                    const SID = await IFFMCData.SIDS.get(IFData.route.SID,IFData.route.origin.code);
                    const STAR = await IFFMCData.STARS.get(IFData.route.STAR,IFData.route.destination.code);
                    console.log(SID);
                    console.log(STAR);
                    IFData.route.fixes.forEach(fix => {
                        let name = fix;
                        if(name == "//SID" && SID){
                            console.log(SID);
                            SID.waypoints.forEach(waypoint =>{
                                IFC.sendCommand({
                                    "Command": "Commands.FlightPlan.AddWaypoints",
                                    "Parameters": [{ "Name": "WPT", "Value": waypoint }]
                                });
                            })
                        }else if(name == "//STAR" && STAR){
                            STAR.waypoints.forEach(waypoint => {
                                IFC.sendCommand({
                                    "Command": "Commands.FlightPlan.AddWaypoints",
                                    "Parameters": [{ "Name": "WPT", "Value": waypoint }]
                                });
                            })
                        }else{
                            IFC.sendCommand({
                                "Command": "Commands.FlightPlan.AddWaypoints",
                                "Parameters": [{ "Name": "WPT", "Value": name }]
                            });
                        }
                        
                    })
                    IFC.sendCommand({
                        "Command": "Commands.FlightPlan.AddWaypoints",
                        "Parameters": [{ "Name": "WPT", "Value": IFData.route.destination.code }]
                    });
                }
                    
                }
            
            
            if(program.data.pageNum == 0){
                //Origin
                    //Header
                    renderText("ORIGIN", [15, 110], {fontSize: "25px", weight: "bold"});
                    //Value
                    renderText(IFData.route.origin.code != "" ? IFData.route.origin.code : "☐☐☐☐", [15, 160], {fontSize: "35px"});
                //Destination
                    //Header
                    renderText("DEST", [985, 110], {fontSize: "25px", weight: "bold", align: "right"});
                    //Value
                    renderText(IFData.route.destination.code != "" ? IFData.route.destination.code : "☐☐☐☐", [985, 160], { fontSize: "35px", align: "right"});
                //DB Route
                    //Header
                    renderText("DB Route", [985, 215], {fontSize: "25px", weight: "bold", align: "right"});
                    //Value
                    renderText(IFData.route.DBRoute != "" ? IFData.route.DBRoute : "☐☐☐☐", [985, 265], {fontSize: "35px", align: "right"});
            }else{
                let page = program.data.pages.get(`page${program.data.pageNum}`);
                //Columns
                renderText("VIA", [15, 110], {fontSize: "25px", weight: "bold"});
                renderText("FIX", [985, 110], { fontSize: "25px", weight: "bold", align: "right"});
                let integer = 0;
                //Waypoint 1
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] == "//SID"||IFData.route.fixes[page.data.routePlus + integer] == "//STAR" ? "11FF11" : "FFFFFF" : "FFFFFF" })
                integer = 1;
                //Waypoint 2
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] == "//SID"||IFData.route.fixes[page.data.routePlus + integer] == "//STAR" ? "11FF11" : "FFFFFF" : "FFFFFF"  })
                integer = 2;
                //Waypoint 3
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] == "//SID"||IFData.route.fixes[page.data.routePlus + integer] == "//STAR" ? "11FF11" : "FFFFFF" : "FFFFFF"  })
                integer = 3;
                //Waypoint 4
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] == "//SID"||IFData.route.fixes[page.data.routePlus + integer] == "//STAR" ? "11FF11" : "FFFFFF" : "FFFFFF"  })
                integer = 4;
                //Waypoint 5
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] == "//SID"||IFData.route.fixes[page.data.routePlus + integer] == "//STAR" ? "11FF11" : "FFFFFF" : "FFFFFF" })
            }
            let pagesRequired = Math.floor(IFData.route.fixes.length / 5) + 1;
            let currentPages = program.data.pages.size - 1;
            currentIntervals = 0;
            let pageChecker = setInterval(() => {
                currentIntervals++;
                if (pagesRequired > currentPages && currentIntervals <= safeIntervals) {
                    program.data.pages.set(`page${currentPages + 1}`, {
                        num: currentPages + 1,
                        data: {
                            sbLayout: {
                                left: {},
                                right: {
                                    button1: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 0;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button2: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 1;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button3: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 2;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button4: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 3;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    },
                                    button5: function () {
                                        let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                        let integer = 4;
                                        if (SPInput != "") {
                                            IFData.route.fixes[page.data.routePlus + integer] = SPInput;
                                            SPInput = "";
                                        } else {
                                            SPInput = IFData.route.fixes[page.data.routePlus + integer];
                                            IFData.route.fixes[page.data.routePlus + integer] = "";
                                        }
                                    }
                                }
                            },
                            routePlus: currentPages * 5
                        }
                    })
                    currentPages = program.data.pages.size - 1;
                } else if (pagesRequired < currentPages) {
                    currentPages = program.data.pages.size - 1;
                    program.data.pages.delete(`page${currentPages}`);
                } else {
                    clearInterval(pageChecker)
                }
            }, 25);
        }
    },
    DEPARR: {
        onLoad: function () {
            let program = programs.DEPARR;
            program.data.step = "CORE";
            buttonActions.MENU = function () {
                programs.DEPARR.data.step = "CORE";
            }
            program.data.pages.set('page0', {
                num: 0,
                sbLayout: {
                    left: {
                        button1: function () {
                            if(false){

                            }
                        }
                    }
                }
            })
        },
        onPageChange: function (type){
            let program = programs.DEPARR;
            if (type == "UP") {
                if (program.data.pages.has(`page${program.data.pageNum + 1}`)) {
                    program.data.pageNum++;
                } else {
                    error("NO PAGE FOUND", 1000)
                }
            } else {
                if (program.data.pages.has(`page${program.data.pageNum - 1}`)) {
                    program.data.pageNum--;
                } else {
                    error("NO PAGE FOUND", 1000)
                }
            }
        },
        data: {
            pageNum: 0,
            pages: new Map(),
            step: "CORE",
            DData: {
                airport: "",
                data: null
            },
            AData: {
                airport: "",
                data: null
            }
        },
        constant: async function () {
            const program = programs.DEPARR;
            //Program title
            renderText("DEP/ARR", [500, 65], { fontSize: "50px", weight: "bold", align: "center" })
            if(IFData.route.origin.code){
                if(IFData.route.destination.code){
                    let departureData;
                    if(program.data.DData.airport != IFData.route.destination.code){
                        program.data.DData.airport = IFData.route.destination.code;
                        departureData = await IFFMCData.SIDS.getAll(IFData.route.origin.code);
                        program.data.DData.data = departureData;
                    }
                    departureData = program.data.DData.data;
                    let arrivalData;
                    if (program.data.AData.airport != IFData.route.destination.code) {
                        program.data.AData.airport = IFData.route.destination.code;
                        arrivalData = await IFFMCData.STARS.getAll(IFData.route.destination.code);
                        program.data.AData.data = arrivalData;
                    }
                    arrivalData = program.data.AData.data;
                            if (program.data.step == "CORE") {
                                if(program.data.pages.size != 1){
                                    program.data.pages.clear();
                                    program.data.pages.set("page0", {

                                    })
                                }
                                
                                //Left Column
                                if (departureData) {
                                    renderText("< DEPARTURE", [15, 160], { fontSize: "35px", align: "left" })
                                }else{
                                    renderText("✕ DEPARTURE", [15, 160], { fontSize: "35px", align: "left", color: "FF1111"});
                                }
                                
                                
                                //Center Column
                                renderText(IFData.route.origin.code, [500, 160], { fontSize: "35px", align: "center" })
                                renderText(IFData.route.destination.code, [500, 265], { fontSize: "35px", align: "center" })
                                //Right Column
                                //renderText("ARRIVAL >", [985, 160], { fontSize: "35px", align: "right" })
                                if (arrivalData) {
                                    renderText("ARRIVAL >", [985, 265], { fontSize: "35px", align: "right" })
                                } else {
                                    renderText("ARRIVAL ✕", [985, 265], { fontSize: "35px", align: "right", color: "FF1111" });
                                }
                                buttonActions.sideButtons = {
                                    left: {
                                        button1: function () {
                                            if(departureData){
                                                program.data.step = "DEPARTURE"
                                                program.data.airport = IFData.route.origin.code
                                            }
                                        }
                                    },
                                    right: {
                                        button1: function () {
                                            //program.data.step = "ARRIVAL"
                                            //program.data.airport = IFData.route.origin.code
                                        },
                                        button2: function () {
                                            if (arrivalData) {
                                                program.data.step = "ARRIVAL"
                                                program.data.airport = IFData.route.destination.code
                                            }
                                            
                                        }
                                    }
                                }
                            }else if(program.data.step == "DEPARTURE"){
                                let pagesRequired = Math.floor(departureData.size / 5) + 1;
                                let currentPages = program.data.pages.size;
                                currentIntervals = 0;
                                let pageChecker = setInterval(() => {
                                    currentIntervals++;
                                    if (pagesRequired > currentPages && currentIntervals <= safeIntervals && program.data.step == "DEPARTURE") {
                                        program.data.pages.set(`page${currentPages}`)
                                        currentPages = program.data.pages.size;
                                    } else if (pagesRequired < currentPages) {
                                        currentPages = program.data.pages.size - 1;
                                        program.data.pages.delete(`page${currentPages}`);
                                    }else{
                                        clearInterval(pageChecker)
                                    }
                                }, 25)
                                //Columns
                                renderText("RUNWAY", [15, 110], { fontSize: "25px", weight: "bold" });
                                renderText("SID", [985, 110], { fontSize: "25px", weight: "bold", align: "right" });
                                const currentPage = program.data.pages.get(`page${program.data.pageNum}`);
                                const pagePlus = (program.data.pageNum * 5);
                                let departureArray = [];
                                departureData.forEach(SID =>{
                                    departureArray.push(SID)
                                })
                                let integer = 0;
                                let names = [];
                                //Number 1
                                if(departureArray[integer + pagePlus]){
                                    //Runways
                                    renderText(departureArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF"});
                                    //Name
                                    names.push(departureArray[integer + pagePlus].name);
                                    renderText(departureArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button1 = function () {
                                        IFData.route.SID = names[0];
                                    }
                                }  
                                integer = 1;
                                //Number 2
                                if (departureArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(departureArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(departureArray[integer + pagePlus].name);
                                    renderText(departureArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button2 = function () {
                                        IFData.route.SID = names[1];
                                    }
                                }
                                integer = 2;
                                //Number 3
                                if (departureArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(departureArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(departureArray[integer + pagePlus].name);
                                    renderText(departureArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button3 = function () {
                                        IFData.route.SID = names[2];
                                    }
                                }
                                integer = 3;
                                //Number 4
                                if (departureArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(departureArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(departureArray[integer + pagePlus].name);
                                    renderText(departureArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button4 = function () {
                                        IFData.route.SID = names[3];
                                    }
                                }
                                integer = 4;
                                //Number 5
                                if (departureArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(departureArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(departureArray[integer + pagePlus].name);
                                    renderText(departureArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.SID == departureArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button5 = function () {
                                        IFData.route.SID = names[4];
                                    }
                                }
                            } else if (program.data.step == "ARRIVAL") {
                                let pagesRequired = Math.floor(arrivalData.size / 5) + 1;
                                let currentPages = program.data.pages.size;
                                currentIntervals = 0;
                                let pageChecker = setInterval(() =>{
                                    currentIntervals++;
                                    if (pagesRequired > currentPages && currentIntervals <= safeIntervals && program.data.step == "ARRIVAL") {
                                        program.data.pages.set(`page${currentPages}`)
                                        currentPages = program.data.pages.size;
                                    } else if (pagesRequired < currentPages) {
                                        currentPages = program.data.pages.size - 1;
                                        program.data.pages.delete(`page${currentPages}`);
                                    }else{
                                        clearInterval(pageChecker)
                                    }
                                }, 25);
                                //Columns
                                renderText("RUNWAY", [15, 110], { fontSize: "25px", weight: "bold" });
                                renderText("STAR", [985, 110], { fontSize: "25px", weight: "bold", align: "right" });
                                const currentPage = program.data.pages.get(`page${program.data.pageNum}`);
                                const pagePlus = (program.data.pageNum * 5);
                                let arrivalArray = [];
                                arrivalData.forEach(STAR => {
                                    arrivalArray.push(STAR)
                                })
                                let integer = 0;
                                let names = [];
                                //Number 1
                                if (arrivalArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(arrivalArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(arrivalArray[integer + pagePlus].name);
                                    renderText(arrivalArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button1 = function () {
                                        IFData.route.STAR = names[0];
                                    }
                                }
                                integer = 1;
                                //Number 2
                                if (arrivalArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(arrivalArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(arrivalArray[integer + pagePlus].name);
                                    renderText(arrivalArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button2 = function () {
                                        IFData.route.STAR = names[1];
                                    }
                                }
                                integer = 2;
                                //Number 3
                                if (arrivalArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(arrivalArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(arrivalArray[integer + pagePlus].name);
                                    renderText(arrivalArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button3 = function () {
                                        IFData.route.STAR = names[2];
                                    }
                                }
                                integer = 3;
                                //Number 4
                                if (arrivalArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(arrivalArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(arrivalArray[integer + pagePlus].name);
                                    renderText(arrivalArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button4 = function () {
                                        IFData.route.STAR = names[3];
                                    }
                                }
                                integer = 4;
                                //Number 5
                                if (arrivalArray[integer + pagePlus]) {
                                    //Runways
                                    renderText(arrivalArray[integer + pagePlus].runways.join(','), [15, 160 + (integer * 105)], { fontSize: "35px", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Name
                                    names.push(arrivalArray[integer + pagePlus].name);
                                    renderText(arrivalArray[integer + pagePlus].name, [985, 160 + (integer * 105)], { fontSize: "35px", align: "right", color: IFData.route.STAR == arrivalArray[integer + pagePlus].name ? "11FF11" : "FFFFFF" });
                                    //Config
                                    buttonActions.sideButtons.right.button5 = function () {
                                        IFData.route.STAR = names[4];
                                    }
                                }
                            }
                }else{
                    error("MISSING ARR AIRPORT", 5000);
                }
            }else{
                error("MISSING DEP AIRPORT", 5000);
            }
            
        }
    }
};

programs[currentProgram].onLoad();

//Infinite Flight Data
const IFData = {
    connected: false,
    device: null,
    version: "0.0",
    vehicle: {
        model: "",
        livery: ""
    },
    route: {
        SID: "",
        STAR: "",
        fixes: [],
        origin: {
            code: "",
            runway: ""
        },
        destination:{
            code: "",
            runway: ""
        },
        DBRoute: ""
    }
}
IFC.init(
    function (initData) {
        console.log("IFC connected");
        IFData.connected = true;
        IFData.device = initData.DeviceName;
        IFData.version = initData.Version.split('.')[0] + "." + initData.Version.split('.')[1];
        IFData.vehicle.model = initData.Aircraft;
        IFData.vehicle.livery = initData.Livery;
        setTimeout(() => {
            IFC.getAirplaneState((data) => {
                console.log(data)
            })
        }, 5000);

    },
    function () {
        IFData.connected = null;
        IFC.log("IFC connection error");
    }
)

//Render
    //Core
    const displayObject = document.getElementById('screen');
    //@ts-ignore
    const displayCTX = displayObject.getContext('2d');
    //@ts-ignore
    displayObject.width = 1000;
    //@ts-ignore
    displayObject.height = 774;
    /**
     * 
     * @param {string} text 
     * @param {Array<number>} position 
     * @param {style} style 
     */
    function renderText(text, position, style) {
        displayCTX.fillStyle = "#" + (style.color ? style.color : "FFFFFF");
        displayCTX.font = `${style.weight ? style.weight : SPStyle.weight} ${style.fontSize ? style.fontSize : SPStyle.fontSize} ${style.fontFamily ? style.fontFamily : SPStyle.fontFamily}`;
        displayCTX.strokeStyle = "#" + (style.color ? style.color : "FFFFFF");
        displayCTX.textAlign = style.align ? style.align : SPStyle.align;
        displayCTX.fillText(text, position[0], position[1]);
        displayCTX.fillStyle = "#" + SPStyle.color;
        displayCTX.font = `${SPStyle.weight} ${SPStyle.fontSize} ${SPStyle.fontFamily}`;
        displayCTX.strokeStyle = "#" + SPStyle.color;
        displayCTX.textAlign = SPStyle.align;
    }
    /**
     * 
     * @param {Array<number>} start 
     * @param {Array<number>} end
     * @param {number} dash 
     * @param {number} width 
     * @param {string} color 
     */
    function renderLine(start, end, dash, width, color) {
        displayCTX.strokeStyle = "#" + color;
        displayCTX.lineWidth = width;
        displayCTX.beginPath();
        displayCTX.setLineDash([dash]);
        displayCTX.moveTo(start[0], start[1]);
        displayCTX.lineTo(end[0], end[1]);
        displayCTX.stroke();
        displayCTX.fillStyle = "#" + SPStyle.color;
        displayCTX.font = `${SPStyle.weight} ${SPStyle.fontSize} ${SPStyle.fontFamily}`;
        displayCTX.strokeStyle = "#" + SPStyle.color;
        displayCTX.lineWidth = 5;
    }
    //Constant
        //Render Core
        setInterval(() => {
            //@ts-ignore
            displayCTX.clearRect(0, 0, displayObject.width, displayObject.height);
            //SP
            renderScratchPad();
            //Numbers
            renderPageNumbers();
            //Program
            programs[currentProgram].constant();
        }, 50);
    //Scratch Pad
    function renderScratchPad() {
        //Line
        renderLine([15,650],[985,650], 25, 2.5, "00CCFF");
        switch(SPState){
            case "AI":
                renderText('[', [0, 750], {color: "00CCFF", weight: 'bold', fontSize: "40px"})
                renderText(SPInput, [25, 750], {color: "FFFFFF", fontSize: "40px"})
                renderText(']', [1000, 750], { color: "00CCFF", weight: 'bold', fontSize: "40px", align: "right" })
                break;
            case "CE":
                renderText(SPComp, [20, 740], { color: "FF1111", weight: 'bold', fontSize: "40px"})
                break;
            case "CW":
                renderText(SPComp, [20, 740], { color: "FFA500", fontSize: "40px"})
                break;
        }
    }
    //Page Number
    function renderPageNumbers(){
        //Get program
        let program = programs[currentProgram];
        let currentPage = program.data.pageNum;
        let maxPages = program.data.pages.size;
        renderText(`(${currentPage + 1}/${maxPages})`, [980, 40], { color: "FFFFFF", fontSize: "25px", weight: "bold", align: "right"})
    }

    
    
window.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key == "."){
        IFFMCData.newData(() =>{
            programs.DEPARR.data.AData.airport = "";
            programs.DEPARR.data.DData.airport = "";
        });
        
    }else if(e.ctrlKey && e.key == "/"){
        IFData.route.origin.code = "VTBS";
        IFData.route.destination.code = "RJTT";
        IFData.route.SID = "ALBO3H";
        IFData.route.STAR = "ADDUM";
        IFData.route.fixes[0] = "//SID";
        IFData.route.fixes[1] = "//STAR";
    }else if (keyboardEnabled) {
        switch ((e.key).toUpperCase()) {
            case "BACKSPACE":
                buttonClick('char', "DEL");
                break;
            case "META":
            case "DEAD":
            case "ALT":
            case "CONTROL":
            case "SHIFT":
                break;
            case " ":
                buttonClick('char','SP');
                break;
            default:
                let value = e.key.toUpperCase();
                if(isNaN(parseInt(value))){
                    buttonClick("char", value);
                }else{
                    buttonClick("num", parseInt(value));
                }
                break;
        }
    }
})