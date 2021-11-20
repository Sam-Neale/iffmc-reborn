//@ts-check
//Requirements
const request = require('request');
const IFC = require('ifc-evolved');

//Globals
let debug = true;
let SPInput = "";
let SPState = "AI";
let SPComp = "";
let currentErrorVar = false;
let keyboardEnabled = false;

/*@type {style}*/
const SPStyle = {
    color: "FFFFFF",
    weight: "normal",
    fontSize: "30px",
    fontFamily: "Courier New",
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
                console.log(numbers)
                console.log(numbers != NaN)
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
            renderText("IDENT", [500, 65], {fontSize: "50px", weight: "bold", align: "center"})
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
                                    const options = {
                                        method: 'GET',
                                        url: `https://raw.githubusercontent.com/Sam-Neale/IFFMC-Routes/master/routes/${IFData.route.DBRoute}.json`
                                    };
                                    request(options, function (errorNET, response, body) {
                                        if (errorNET) throw new Error(errorNET);
                                        if (response.statusCode == 200) {
                                            const route = JSON.parse(body);
                                            IFData.route.fixes = route.fixArray;
                                            currentErrorVar = false;
                                            warn("FPLN Loaded", 2500);
                                            let pagesRequired = Math.floor(IFData.route.fixes.length / 5) + 1;
                                            let currentPages = program.data.pages.size - 1;
                                            while (pagesRequired > currentPages) {
                                                console.log(pagesRequired, currentPages)
                                                program.data.pages.set(`page${currentPages + 1}`, {
                                                    num: currentPages + 1,
                                                    data: {
                                                        sbLayout: {
                                                            left: {},
                                                            right: {
                                                                button1: function () {
                                                                    let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                                                    let integer = 0;
                                                                    console.log(SPInput)
                                                                    if (SPInput != "") {
                                                                        console.log("ADD")
                                                                        console.log(page.data.routePlus, integer)
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
                                            }
                                        } else if (response.statusCode == 404) {
                                            currentErrorVar = false;
                                            setTimeout(() => {
                                                error("FPLN UNAVILABLE", 2500);
                                                SPInput = IFData.route.DBRoute;
                                                IFData.route.DBRoute = "";
                                                IFData.route.fixes = [];
                                            }, 100);
                                        } else {
                                            currentErrorVar = false;
                                            error("FPLN UNAVILABLE", 2500);
                                            SPInput = IFData.route.DBRoute;
                                            IFData.route.DBRoute = "";
                                            IFData.route.fixes = [];
                                            console.error(body);
                                        }

                                    });
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
                                console.log(SPInput)
                                if(SPInput != ""){
                                    console.log("ADD")
                                    console.log(page.data.routePlus, integer)
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
                                if (SPInput == "") {
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
            while (pagesRequired > currentPages) {
                console.log(pagesRequired, currentPages)
                program.data.pages.set(`page${currentPages + 1}`, {
                    num: currentPages + 1,
                    data: {
                        sbLayout: {
                            left: {},
                            right: {
                                button1: function () {
                                    let page = programs.RTE.data.pages.get(`page${programs.RTE.data.pageNum}`)
                                    let integer = 0;
                                    console.log(SPInput)
                                    if (SPInput != "") {
                                        console.log("ADD")
                                        console.log(page.data.routePlus, integer)
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
            }
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
                    console.log(npage)
                    if(npage.data.sbLayout){
                        console.log("MAYBE?")
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
        constant: function (page) {
            let program = programs.RTE;
            //Program title
            renderText("ROUTE", [500, 65], { fontSize: "50px", weight: "bold", align: "center" })
            buttonActions.EXEC = function () {
                if(currentProgram == "RTE"){
                    IFC.sendCommand({
                        "Command": "Commands.FlightPlan.Clear",
                        "Parameters": []
                    })
                    /*IFC.sendCommand({
                        "Command": "Commands.FlightPlan.AddWaypoints",
                        "Parameters": [{ "Name": "WPT", "Value": IFData.route.origin}]
                    });*/
                    IFData.route.fixes.forEach(fix => {
                        let name = fix;
                        IFC.sendCommand({
                            "Command": "Commands.FlightPlan.AddWaypoints",
                            "Parameters": [{ "Name": "WPT", "Value": name }]
                        });
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
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], {fontSize: "35px", align: "right"})
                integer = 1;
                //Waypoint 2
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right" })
                integer = 2;
                //Waypoint 3
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right" })
                integer = 3;
                //Waypoint 4
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right" })
                integer = 4;
                //Waypoint 5
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? "DIRECT" : "", [15, 160 + (integer * 105)], { fontSize: "35px" })
                renderText(IFData.route.fixes[page.data.routePlus + integer] ? IFData.route.fixes[page.data.routePlus + integer] : "☐☐☐☐☐☐", [985, 160 + (integer * 105)], { fontSize: "35px", align: "right" })
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
        }, 150);
    //Scratch Pad
    function renderScratchPad() {
        //Line
        renderLine([0,650],[1000,650], 15, 5, "FFFFFF");
        switch(SPState){
            case "AI":
                renderText(SPInput, [20, 740], {color: "FFFFFF", fontSize: "40px"})
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
    if (keyboardEnabled) {
        switch ((e.key).toUpperCase()) {
            case "BACKSPACE":
                buttonClick('char', "DEL");
                break;
            case "META":
            case "DEAD":
            case "ALT":
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