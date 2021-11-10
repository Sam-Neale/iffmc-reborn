//@ts-check

//Sounds
// collection of sounds that are playing
var playing = {};
// collection of sounds
var sounds = { click: "click.mp3"};

// function that is used to play sounds
function player(x) {
    var a, b;
    b = new Date();
    a = x + b.getTime();
    playing[a] = new Audio(sounds[x]);
    // with this we prevent playing-object from becoming a memory-monster:
    playing[a].onended = function () { delete playing[a] };
    playing[a].play();
}

function buttonClick(type, value){
    //Play Sound
    player('click');
    console.log(type);
    console.log(value);
    if(type == "function"){
        let program = programData.programs[programData.programs.current];
        let page = program.pages[program.pages.current];
        sideButtons.reset();
        switch(value){
            case "NPage":
                if(page.nPage != null){
                    program.pages.current = page.nPage[1];
                }else{
                    SPDataTemp = SPData;
                    SPData = "NO PAGE"
                    SPError = true;
                    setTimeout(() => {
                        if(SPError){
                            SPData = SPDataTemp;
                            SPError = false;
                        }
                    }, 2500);
                }
                
                break;
            case "PPage":
                if (page.pPage != null) {
                    program.pages.current = page.pPage[1];
                } else {
                    SPDataTemp = SPData;
                    SPData = "NO PAGE"
                    SPError = true;
                    setTimeout(() => {
                        if (SPError) {
                            SPData = SPDataTemp;
                            SPError = false;
                        }
                    }, 2500);
                }
                break;
            case "INITREF":
                programData.programs.current = "INIT_REF";
                break;
            case "RTE":
                programData.programs.current = "RTE";
                break;
            case "LEGS":
                programData.programs.current = "LEGS";
                break;
            case "DEPARR":
                programData.programs.current = "DEPARR";
                break;
            case "EXEC":
                buttonActions.exec.action();
                break;
            default:
                console.error("Unknown Value");
                break;
        }
    }else if(type == "function-left"){
        sideButtons.left[`button${value + 1}`].func();
    }else if (type == "function-right"){
        sideButtons.right[`button${value + 1}`].func();
    }else if(type == "num"){
        if(value == "INVERT"){

        }else{
            SPData += value;
        }
    }else if(type == "char"){
        displayCTX.textAlign = 'left';
        if(value == "DEL"){
            if (SPError == true) {
                SPError = false;
                SPData = "";
            }else{
                SPData = SPData.slice(0, -1)
            }
        }else if(value == "CLR"){
            if (SPError == true) {
                SPError = false;
            }
            SPData = "";
        }else{
            if(SPError == true){
                SPError = false;    
                SPData = "";
            }
            SPData += value;
        }
    }else{
        console.error("Unknown type");
    }
}

const displayObject = document.getElementById('screen');
//@ts-ignore
const displayCTX = displayObject.getContext('2d');

let buttonActions = {
    exec: {
        program: 'INIT',
        action: function(){
            console.log("Executed")
        }
    }
}

//@ts-ignore
displayObject.width = 1000;
//@ts-ignore
displayObject.height = 774;

//1.312042553191489

function renderDisplay(){
    //@ts-ignore
    displayCTX.clearRect(0, 0, displayObject.width, displayObject.height);
    displayCTX.fillStyle = '#FFFFFF';
    displayCTX.font = "bold 30px Courier New"
    displayCTX.strokeStyle = '#FFFFFF';
    displayCTX.lineWidth = 5;
    //Scratch Pad
        //Line
        displayCTX.beginPath();
        displayCTX.setLineDash([15]);
        displayCTX.moveTo(0,650);
        displayCTX.lineTo(1000, 650);
        displayCTX.stroke();
        if(SPError == true){
            displayCTX.fillStyle = '#FF1111';
        }else{
            displayCTX.fillStyle = '#FFFFFF';
        }
        displayCTX.fillText(SPData, 20, 740);
        displayCTX.fillStyle = '#FFFFFF';
        
    //Pages
    let program = programData.programs[programData.programs.current];
    let page = program.pages[program.pages.current];
    let maxPages = program.pages.max;
    displayCTX.textAlign = 'right';
    displayCTX.fillText(`(${page.order}/${maxPages})`, 980, 40);
    displayCTX.textAlign = 'left';
    programData.renderProgram();
        
}

setInterval(renderDisplay, 250);

let SPData = "";
let SPDataTemp = '';
let SPError = false;

const programData = {
    programs: {
        current: 'INIT_REF',
        INIT_REF:{
            render: () =>{
                //Page Title
                displayCTX.textAlign = 'center';
                displayCTX.font = "bold 50px Courier New"
                displayCTX.fillText("IDENT", 500, 65);
                //IF Status
                if(infiniteFlightData.connected == true){
                    //Header
                    displayCTX.textAlign = 'left';
                    displayCTX.font = "bold 25px Courier New";
                    displayCTX.fillText("Connection", 15, 110);
                    //Status
                    displayCTX.font = "normal 35px Courier New";
                    displayCTX.fillText("Connected", 15, 160);
                    //Version
                        displayCTX.textAlign = 'right';
                        //Header
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("IF Version", 985, 110);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.version, 985, 160);
                    //Device
                        //Header
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("Device", 985, 215);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.device, 985, 265);
                    displayCTX.textAlign = 'left';
                    //Aircraft
                        //Header
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("Aircraft", 15, 215);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.vehicle.aircraft, 15, 265);
                    //Livery
                        //Header
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("Livery", 15, 320);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.vehicle.livery, 15, 370);
                }else if(infiniteFlightData.connected == false){
                    //Header
                    displayCTX.textAlign = 'left';
                    displayCTX.font = "bold 25px Courier New";
                    displayCTX.fillText("Connection", 15, 110);
                    //Status
                    displayCTX.font = "normal 35px Courier New";
                    displayCTX.fillText("Looking", 15, 160);
                }else{
                    //Header
                    displayCTX.textAlign = 'left';
                    displayCTX.font = "bold 25px Courier New";
                    displayCTX.fillText("Connection", 15, 110);
                    //Status
                    displayCTX.font = "normal 35px Courier New";
                    displayCTX.fillText("Failed", 15, 160);
                    //RELOAD
                    displayCTX.font = "bold 35px Courier New";
                    displayCTX.fillText("Restart FMC", 15, 265);
                    sideButtons.left.button2.func = function () {
                        window.location.reload();
                    }
                }
            },
            pages: {
                current: 'page1',
                max: 1,
                page1: {
                    order: 1,
                    nPage: null,
                    pPage: null,
                }
            }
        },
        RTE: {
            render: () => {
                //Program Title
                displayCTX.textAlign = 'center';
                displayCTX.font = "bold 50px Courier New"
                displayCTX.fillText("ROUTE", 500, 65);

                //Execute
                if(buttonActions.exec.program != "RTE"){
                    buttonActions.exec.program = "RTE";
                    buttonActions.exec.action = function () {
                        IFC.sendCommand({
                            "Command": "Commands.FlightPlan.Clear",
                            "Parameters": []
                        })
                        /*IFC.sendCommand({
                            "Command": "Commands.FlightPlan.AddWaypoints",
                            "Parameters": [{ "Name": "WPT", "Value": infiniteFlightData.route.origin}]
                        });*/
                        infiniteFlightData.route.fixes.forEach(fix => {
                            let name = fix;
                            if (infiniteFlightData.route.alts.has(fix)) {
                                let AltVal = infiniteFlightData.route.alts.get(fix);
                                if (AltVal) {
                                    name += AltVal.toString();
                                }
                            }
                            console.log(name);
                            IFC.sendCommand({
                                "Command": "Commands.FlightPlan.AddWaypoints",
                                "Parameters": [{ "Name": "WPT", "Value": name }]
                            });
                        })
                        IFC.sendCommand({
                            "Command": "Commands.FlightPlan.AddWaypoints",
                            "Parameters": [{ "Name": "WPT", "Value": infiniteFlightData.route.destination }]
                        });
                    }
                }

                let pageNum = programData.programs.RTE.pages.current;

                if (pageNum == "page1"){
                    //Origin
                        //Header
                        displayCTX.textAlign = 'left';
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("ORIGIN", 15, 110);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.route.origin != "" ? infiniteFlightData.route.origin : "☐☐☐☐", 15, 160);
                    //Dest
                        //Header
                        displayCTX.textAlign = 'right';
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("DEST", 985, 110);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.route.destination != "" ? infiniteFlightData.route.destination : "☐☐☐☐", 985, 160);
                        displayCTX.textAlign = 'left';
                    //Runway
                        //Header
                        displayCTX.textAlign = 'left';
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("RUNWAY", 15, 215);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.route.depRunway != "" ? infiniteFlightData.route.depRunway : "☐☐☐", 15, 265);
                        displayCTX.textAlign = 'left';
                }else{
                    //Left Col Header
                    displayCTX.textAlign = 'left';
                    displayCTX.font = "bold 30px Courier New";
                    displayCTX.fillText("VIA", 15, 105);
                    //Right Col Header
                    displayCTX.textAlign = 'right';
                    displayCTX.font = "bold 30px Courier New";
                    displayCTX.fillText("TO", 985, 105);
                    
                    //Get current page
                    let program = programData.programs[programData.programs.current];
                    let page = program.pages[program.pages.current];
                    //Get Fix Plus
                    let fixPlus = page.custom.fixPlus;
                    //Calculate next page required
                    if (page.nPage == null && infiniteFlightData.route.fixes[page.custom.fixPlus + 4]){
                        let nPageNum = Object.keys(program.pages).length - 1;
                        page.nPage = ['Fixes Cont.', `page${nPageNum}`];
                        program.pages.max++;
                        program.pages[`page${nPageNum}`] = {
                            nPage: null,
                            pPage: ["Fixes", `page${(nPageNum-1).toString()}`],
                            order: nPageNum,
                            custom: {
                                fixPlus: (nPageNum * 5) - 10
                            },
                            sideButtons:{
                                left: [
                                    ['button1', () => {
                                        displayCTX.textAlign = 'left';
                                        if (SPData != "AIRWAYS NOT ALLOWED") {
                                            SPDataTemp = SPData;
                                        }
                                        SPData = "AIRWAYS NOT ALLOWED"
                                        SPError = true;
                                        setTimeout(() => {
                                            if (SPError) {
                                                SPData = SPDataTemp;
                                                SPError = false;
                                            }
                                        }, 2500);
                                    }],
                                    ['button2', () => {
                                        displayCTX.textAlign = 'left';
                                        if (SPData != "AIRWAYS NOT ALLOWED") {
                                            SPDataTemp = SPData;
                                        }
                                        SPData = "AIRWAYS NOT ALLOWED"
                                        SPError = true;
                                        setTimeout(() => {
                                            if (SPError) {
                                                SPData = SPDataTemp;
                                                SPError = false;
                                            }
                                        }, 2500);
                                    }],
                                    ['button3', () => {
                                        displayCTX.textAlign = 'left';
                                        if (SPData != "AIRWAYS NOT ALLOWED") {
                                            SPDataTemp = SPData;
                                        }
                                        SPData = "AIRWAYS NOT ALLOWED"
                                        SPError = true;
                                        setTimeout(() => {
                                            if (SPError) {
                                                SPData = SPDataTemp;
                                                SPError = false;
                                            }
                                        }, 2500);
                                    }],
                                    ['button4', () => {
                                        displayCTX.textAlign = 'left';
                                        if (SPData != "AIRWAYS NOT ALLOWED") {
                                            SPDataTemp = SPData;
                                        }
                                        SPData = "AIRWAYS NOT ALLOWED"
                                        SPError = true;
                                        setTimeout(() => {
                                            if (SPError) {
                                                SPData = SPDataTemp;
                                                SPError = false;
                                            }
                                        }, 2500);
                                    }],
                                    ['button5', () => {
                                        displayCTX.textAlign = 'left';
                                        if (SPData != "AIRWAYS NOT ALLOWED") {
                                            SPDataTemp = SPData;
                                        }
                                        SPData = "AIRWAYS NOT ALLOWED"
                                        SPError = true;
                                        setTimeout(() => {
                                            if (SPError) {
                                                SPData = SPDataTemp;
                                                SPError = false;
                                            }
                                        }, 2500);
                                    }],
                                    ['button6', () => {
                                        displayCTX.textAlign = 'left';
                                        if (SPData != "AIRWAYS NOT ALLOWED") {
                                            SPDataTemp = SPData;
                                        }
                                        SPData = "AIRWAYS NOT ALLOWED"
                                        SPError = true;
                                        setTimeout(() => {
                                            if (SPError) {
                                                SPData = SPDataTemp;
                                                SPError = false;
                                            }
                                        }, 2500);
                                    }]
                                ],
                                right: [
                                    ['button1', () => {
                                        let program = programData.programs[programData.programs.current];
                                        let page = program.pages[program.pages.current];
                                        if (SPData != "") {
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + 0] = SPData;
                                            infiniteFlightData.route.alts.set(SPData, null);
                                            SPData = "";
                                        } else {
                                            SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + 0];
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + 0] = "";
                                        }
                                    }],
                                    ['button2', () => {
                                        let program = programData.programs[programData.programs.current];
                                        let page = program.pages[program.pages.current];
                                        let btnNum = 1;
                                        if (SPData != "") {
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                            infiniteFlightData.route.alts.set(SPData, null);
                                            SPData = "";
                                        } else {
                                            SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                        }
                                    }],
                                    ['button3', () => {
                                        let program = programData.programs[programData.programs.current];
                                        let page = program.pages[program.pages.current];
                                        let btnNum = 2;
                                        if (SPData != "") {
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                            infiniteFlightData.route.alts.set(SPData, null);
                                            SPData = "";
                                        } else {
                                            SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                        }
                                    }],
                                    ['button4', () => {
                                        let program = programData.programs[programData.programs.current];
                                        let page = program.pages[program.pages.current];
                                        let btnNum = 3;
                                        if (SPData != "") {
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                            infiniteFlightData.route.alts.set(SPData, null);
                                            SPData = "";
                                        } else {
                                            SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                        }
                                    }],
                                    ['button5', () => {
                                        let program = programData.programs[programData.programs.current];
                                        let page = program.pages[program.pages.current];
                                        let btnNum = 4;
                                        if (SPData != "") {
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                            infiniteFlightData.route.alts.set(SPData, null);
                                            SPData = "";
                                        } else {
                                            SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                            infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                        }
                                    }]
                                ]
                            }
                        }
                    }
                    //Render Values
                    displayCTX.font = "normal 35px Courier New";
                    let plus = 0;
                    //Num 1
                    displayCTX.textAlign = 'right';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? infiniteFlightData.route.fixes[page.custom.fixPlus + plus] : "☐☐☐☐☐", 985, 160);
                    displayCTX.textAlign = 'left';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? "DIRECT" : "", 15, 160);
                    //Num 2
                    plus = 1;
                    displayCTX.textAlign = 'right';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? infiniteFlightData.route.fixes[page.custom.fixPlus + plus] : "☐☐☐☐☐", 985, 265);
                    displayCTX.textAlign = 'left';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? "DIRECT" : "", 15, 265);
                    //Num 3
                    plus = 2;
                    displayCTX.textAlign = 'right';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? infiniteFlightData.route.fixes[page.custom.fixPlus + plus] : "☐☐☐☐☐", 985, 370);
                    displayCTX.textAlign = 'left';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? "DIRECT" : "", 15, 370);
                    //Num 4
                    plus = 3;
                    displayCTX.textAlign = 'right';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? infiniteFlightData.route.fixes[page.custom.fixPlus + plus] : "☐☐☐☐☐", 985, 475);
                    displayCTX.textAlign = 'left';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? "DIRECT" : "", 15, 475);
                    //Num 5
                    plus = 4;
                    displayCTX.textAlign = 'right';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? infiniteFlightData.route.fixes[page.custom.fixPlus + plus] : "☐☐☐☐☐", 985, 580);
                    displayCTX.textAlign = 'left';
                    displayCTX.fillText(infiniteFlightData.route.fixes[page.custom.fixPlus + plus] ? "DIRECT" : "", 15, 580);
                    displayCTX.textAlign = 'left';
                }
                //Buttons
                programData.programs.RTE.pages[pageNum].sideButtons.left.forEach(button =>{
                    let index = button[0];
                    let func = button[1];
                    sideButtons.left[index].func = func;
                })
                programData.programs.RTE.pages[pageNum].sideButtons.right.forEach(button => {
                    let index = button[0];
                    let func = button[1];
                    sideButtons.right[index].func = func;
                })
            },
            pages: {
                current: 'page1',
                max: 2,
                page1: {
                    nPage: ['Fixes', 'page2'],
                    pPage: null,
                    order: 1,
                    sideButtons:{
                        left: [['button1', () =>{
                            if(infiniteFlightData.route.origin == "" || SPData != ""){
                                infiniteFlightData.route.origin = SPData;
                                SPData = "";
                            }else{
                                SPData = infiniteFlightData.route.origin;
                                infiniteFlightData.route.origin = "";
                            }
                        }], ['button2', () => {
                            if (infiniteFlightData.route.depRunway == "" || SPData != "") {
                                infiniteFlightData.route.depRunway = SPData;
                                SPData = "";
                            } else {
                                SPData = infiniteFlightData.route.depRunway;
                                infiniteFlightData.route.depRunway = "";
                            }
                        }]],
                        right: [['button1', () =>{
                            if(infiniteFlightData.route.destination == "" || SPData != ""){
                                infiniteFlightData.route.destination = SPData;
                                SPData = "";
                            }else{
                                SPData = infiniteFlightData.route.destination;
                                infiniteFlightData.route.destination = "";
                            }
                        }]]
                    }
                },
                page2: {
                    nPage: null,
                    pPage: ["Core", "page1"],
                    order: 2,
                    custom:{
                        fixPlus: 0,
                    },
                    sideButtons: {
                        left: [
                            ['button1', () => {
                                displayCTX.textAlign = 'left';
                                if (SPData != "AIRWAYS NOT ALLOWED") {
                                    SPDataTemp = SPData;
                                }
                                SPData = "AIRWAYS NOT ALLOWED"
                                SPError = true;
                                setTimeout(() => {
                                    if (SPError) {
                                        SPData = SPDataTemp;
                                        SPError = false;
                                    }
                                }, 2500);
                            }],
                            ['button2', () => {
                                displayCTX.textAlign = 'left';
                                if (SPData != "AIRWAYS NOT ALLOWED") {
                                    SPDataTemp = SPData;
                                }
                                SPData = "AIRWAYS NOT ALLOWED"
                                SPError = true;
                                setTimeout(() => {
                                    if (SPError) {
                                        SPData = SPDataTemp;
                                        SPError = false;
                                    }
                                }, 2500);
                            }],
                            ['button3', () => {
                                displayCTX.textAlign = 'left';
                                if (SPData != "AIRWAYS NOT ALLOWED") {
                                    SPDataTemp = SPData;
                                }
                                SPData = "AIRWAYS NOT ALLOWED"
                                SPError = true;
                                setTimeout(() => {
                                    if (SPError) {
                                        SPData = SPDataTemp;
                                        SPError = false;
                                    }
                                }, 2500);
                            }],
                            ['button4', () => {
                                displayCTX.textAlign = 'left';
                                if (SPData != "AIRWAYS NOT ALLOWED") {
                                    SPDataTemp = SPData;
                                }
                                SPData = "AIRWAYS NOT ALLOWED"
                                SPError = true;
                                setTimeout(() => {
                                    if (SPError) {
                                        SPData = SPDataTemp;
                                        SPError = false;
                                    }
                                }, 2500);
                            }],
                            ['button5', () => {
                                displayCTX.textAlign = 'left';
                                if (SPData != "AIRWAYS NOT ALLOWED") {
                                    SPDataTemp = SPData;
                                }
                                SPData = "AIRWAYS NOT ALLOWED"
                                SPError = true;
                                setTimeout(() => {
                                    if (SPError) {
                                        SPData = SPDataTemp;
                                        SPError = false;
                                    }
                                }, 2500);
                            }],
                            ['button6', () => {
                                displayCTX.textAlign = 'left';
                                if (SPData != "AIRWAYS NOT ALLOWED") {
                                    SPDataTemp = SPData;
                                }
                                SPData = "AIRWAYS NOT ALLOWED"
                                SPError = true;
                                setTimeout(() => {
                                    if (SPError) {
                                        SPData = SPDataTemp;
                                        SPError = false;
                                    }
                                }, 2500);
                            }]
                        ],
                        right: [
                            ['button1', () => {
                                let program = programData.programs[programData.programs.current];
                                let page = program.pages[program.pages.current];
                                if (SPData != "") {
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + 0] = SPData;
                                    infiniteFlightData.route.alts.set(SPData, null);
                                    SPData = "";
                                } else {
                                    SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + 0];
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + 0] = "";
                                }
                            }],
                            ['button2', () => {
                                let program = programData.programs[programData.programs.current];
                                let page = program.pages[program.pages.current];
                                let btnNum = 1;
                                if (SPData != "") {
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                    infiniteFlightData.route.alts.set(SPData, null);
                                    SPData = "";
                                } else {
                                    SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                }
                            }],
                            ['button3', () => {
                                let program = programData.programs[programData.programs.current];
                                let page = program.pages[program.pages.current];
                                let btnNum = 2;
                                if (SPData != "") {
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                    infiniteFlightData.route.alts.set(SPData, null);
                                    SPData = "";
                                } else {
                                    SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                }
                            }],
                            ['button4', () => {
                                let program = programData.programs[programData.programs.current];
                                let page = program.pages[program.pages.current];
                                let btnNum = 3;
                                if (SPData != "") {
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                    infiniteFlightData.route.alts.set(SPData, null);
                                    SPData = "";
                                } else {
                                    SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                }
                            }],
                            ['button5', () => {
                                let program = programData.programs[programData.programs.current];
                                let page = program.pages[program.pages.current];
                                let btnNum = 4;
                                if (SPData != "") {
                                    console.log("BIG TEST" + page.custom.fixPlus + btnNum)
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = SPData;
                                    infiniteFlightData.route.alts.set(SPData, null);
                                    SPData = "";
                                } else {
                                    SPData = infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum];
                                    infiniteFlightData.route.fixes[page.custom.fixPlus + btnNum] = "";
                                }
                            }]
                        ]
                    }
                }
            }
        },
        DEPARR:{
            render: () => {
                //Page Title
                displayCTX.textAlign = 'center';
                displayCTX.font = "bold 50px Courier New"
                displayCTX.fillText("DEP/ARR", 500, 65);
                if(true){
                    displayCTX.textAlign = 'left';
                    if(SPData != "PAGE NOT AVAILABLE"){
                        SPDataTemp = SPData;
                    }
                    SPData = "PAGE NOT AVAILABLE"
                    SPError = true;
                    setTimeout(() => {
                        if (SPError && programData.programs.current != "DEPARR") {
                            SPData = SPDataTemp;
                            SPError = false;
                        }
                    }, 2500);
                }else{
                    if (infiniteFlightData.route.origin == "" && SPData == "") {
                        SPDataTemp = SPData;
                        SPData = "MISSING DEP AIRPORT"
                        SPError = true;
                        setTimeout(() => {
                            if (SPError) {
                                SPData = SPDataTemp;
                                SPError = false;
                            }
                        }, 2500);
                    } else if (infiniteFlightData.route.destination == "" && SPData == "") {
                        SPDataTemp = SPData;
                        SPData = "MISSING ARR AIRPORT"
                        SPError = true;
                        setTimeout(() => {
                            if (SPError) {
                                SPData = SPDataTemp;
                                SPError = false;
                            }
                        }, 2500);
                    }

                    //Departure
                    //Indicator
                    displayCTX.textAlign = 'left';
                    displayCTX.font = "bold 35px Courier New";
                    displayCTX.fillText("<DEP", 15, 160);
                    //Arrival
                    //Indicator 1
                    //Indicator
                    displayCTX.textAlign = 'right';
                    displayCTX.font = "bold 35px Courier New";
                    displayCTX.fillText("ARR>", 985, 160);
                    //Indicator 2
                    //Indicator
                    displayCTX.font = "bold 35px Courier New";
                    displayCTX.fillText("ARR>", 985, 265);
                    //Airports
                    displayCTX.textAlign = 'center';
                    //Departure
                    displayCTX.font = "normal 35px Courier New";
                    displayCTX.fillText(infiniteFlightData.route.origin, 500, 160);
                    //Arrival
                    displayCTX.font = "normal 35px Courier New";
                    displayCTX.fillText(infiniteFlightData.route.destination, 500, 265);
                    displayCTX.textAlign = 'left';
                }
                
            },
            pages: {
                current: 'page1',
                max: 1,
                page1: {
                    order: 1,
                    nPage: null,
                    pPage: null,
                }
            }
        },
        LEGS:{
            render: () => {
                const program = programData.programs.LEGS;
                let page = program.pages[program.pages.current];
                //Program Title
                displayCTX.textAlign = 'center';
                displayCTX.font = "bold 50px Courier New"
                displayCTX.fillText("LEGS", 500, 65);

                //Execute
                if (buttonActions.exec.program != "LEGS") {
                    buttonActions.exec.program = "LEGS";
                    buttonActions.exec.action = function () {
                        IFC.sendCommand({
                            "Command": "Commands.FlightPlan.Clear",
                            "Parameters": []
                        })
                        /*IFC.sendCommand({
                            "Command": "Commands.FlightPlan.AddWaypoints",
                            "Parameters": [{ "Name": "WPT", "Value": infiniteFlightData.route.origin}]
                        });*/
                        infiniteFlightData.route.fixes.forEach(fix => {
                            let name = fix;
                            if(infiniteFlightData.route.alts.has(fix)){
                                let AltVal = infiniteFlightData.route.alts.get(fix);
                                if(AltVal){
                                    name += AltVal.toString();
                                }
                            }
                            console.log(name);
                            IFC.sendCommand({
                                "Command": "Commands.FlightPlan.AddWaypoints",
                                "Parameters": [{ "Name": "WPT", "Value": name }]
                            });
                        })
                        IFC.sendCommand({
                            "Command": "Commands.FlightPlan.AddWaypoints",
                            "Parameters": [{ "Name": "WPT", "Value": infiniteFlightData.route.destination }]
                        });
                    }
                }

                let pageNum = programData.programs.LEGS.pages.current;
                
                //Calculate pages required
                let fixLength = infiniteFlightData.route.fixes.length;
                let pagesRequired = (Math.floor((fixLength / 5)) + ((fixLength / 5) % 1 == 0 ? 0 : 1));
                if (program.pages.max != pagesRequired && pagesRequired != 0){
                    delete program.pages.page1;
                    program.pages.max = 0;
                    while (pagesRequired != 0) {
                        pagesRequired --;
                        let prevPageNum = program.pages.max;
                        program.pages.max++
                        let newPageNum = program.pages.max;
                        if(prevPageNum != 0){
                            program.pages[`page${prevPageNum}`].nPage = ["Fixes", `page${newPageNum}`]
                        }
                        
                        program.pages[`page${newPageNum}`] = {
                            nPage: null,
                            pPage: prevPageNum != 0 ? ["Fixes", `page${(prevPageNum).toString()}`] : null,
                            order: newPageNum,
                            custom: {
                                fixPlus: (newPageNum - 1) * 5
                            },
                            sideButtons: {
                                left: [],
                            }
                        };
                    }
                }

                //Rendering
                console.log(pagesRequired)
                if(pagesRequired == 0){
                    setTimeout(() => {
                        if(pagesRequired == 0){
                            displayCTX.textAlign = 'left';
                            if (SPData != "NO FIXES FOUND") {
                                SPDataTemp = SPData;
                            }
                            SPData = "NO FIXES FOUND"
                            SPError = true;
                            setTimeout(() => {
                                if (SPError) {
                                    SPData = SPDataTemp;
                                    SPError = false;
                                }
                            }, 2500);
                        }
                    }, 500);
                    
                }else{
                    //Left Col Header
                    displayCTX.textAlign = 'left';
                    displayCTX.font = "bold 30px Courier New";
                    displayCTX.fillText("WAYPOINT", 15, 105);
                    //Right Col Header
                    displayCTX.textAlign = 'right';
                    displayCTX.font = "bold 30px Courier New";
                    displayCTX.fillText("ALTITUDE", 985, 105);
                    //Page 1 Buttons
                    
                    //Render Values
                    let plus = 0;
                    let name = "";
                    let altitude = 0;
                        //L1
                        plus = 0;
                            //Fix name    
                            displayCTX.textAlign = 'left';
                            name = infiniteFlightData.route.fixes[page.custom.fixPlus + plus]
                            displayCTX.fillText(name ? name : "", 15, 160);
                            //Fix altitude
                            displayCTX.textAlign = 'right';
                            altitude = (infiniteFlightData.route.alts.has(name) ? infiniteFlightData.route.alts.get(name) : false);
                            displayCTX.fillText(altitude ? infiniteFlightData.route.alts.get(name) : "☐☐☐☐☐", 985, 160);
                            displayCTX.textAlign = 'left';
                        //L2
                        plus = 1;
                            //Fix name    
                            displayCTX.textAlign = 'left';
                            name = infiniteFlightData.route.fixes[page.custom.fixPlus + plus]
                            displayCTX.fillText(name ? name : "", 15, 265);
                            //Fix altitude
                            displayCTX.textAlign = 'right';
                            altitude = (infiniteFlightData.route.alts.has(name) ? infiniteFlightData.route.alts.get(name) : false);
                            displayCTX.fillText(altitude ? infiniteFlightData.route.alts.get(name) : name ? "☐☐☐☐☐" : "", 985, 265);
                            displayCTX.textAlign = 'left';
                        //L3
                        plus = 2;
                            //Fix name    
                            displayCTX.textAlign = 'left';
                            name = infiniteFlightData.route.fixes[page.custom.fixPlus + plus]
                            displayCTX.fillText(name ? name : "", 15, 370);
                            //Fix altitude
                            displayCTX.textAlign = 'right';
                            altitude = (infiniteFlightData.route.alts.has(name) ? infiniteFlightData.route.alts.get(name) : false);
                            displayCTX.fillText(altitude ? infiniteFlightData.route.alts.get(name) : name ? "☐☐☐☐☐" : "", 985, 370);
                            displayCTX.textAlign = 'left';
                        //L4
                        plus = 3;
                            //Fix name    
                            displayCTX.textAlign = 'left';
                            name = infiniteFlightData.route.fixes[page.custom.fixPlus + plus]
                            displayCTX.fillText(name ? name : "", 15, 475);
                            //Fix altitude
                            displayCTX.textAlign = 'right';
                            altitude = (infiniteFlightData.route.alts.has(name) ? infiniteFlightData.route.alts.get(name) : false);
                            (altitude);
                            displayCTX.fillText(altitude ? infiniteFlightData.route.alts.get(name) : name ? "☐☐☐☐☐" : "", 985, 475);
                            displayCTX.textAlign = 'left';
                        //L5
                        plus = 4;
                            //Fix name    
                            displayCTX.textAlign = 'left';
                            name = infiniteFlightData.route.fixes[page.custom.fixPlus + plus]
                            displayCTX.fillText(name ? name : "", 15, 580);
                            //Fix altitude
                            displayCTX.textAlign = 'right';
                            altitude = (infiniteFlightData.route.alts.has(name) ? infiniteFlightData.route.alts.get(name) : false);
                            (altitude);
                            displayCTX.fillText(altitude ? infiniteFlightData.route.alts.get(name) : name ? "☐☐☐☐☐" : "", 985, 580);
                            displayCTX.textAlign = 'left';

                }
            },
            pages: {
                current: 'page1',
                max: 1,
                page1:{
                    order: 1,
                    nPage: null,
                    pPage: null,
                    custom: {
                        fixPlus: 0
                    },
                    sideButtons: {
                        left: [],
                        right: []
                    }
                }
            }
        }
    },
    renderProgram: function(){
        programData.programs[programData.programs.current].render();
    }
}

let infiniteFlightData = {
    connected: false,
    version: "0.0",
    device: "Unknown",
    vehicle:{
        aircraft: "",
        livery: ""
    },
    route:{
        fixes:[

        ],
        alts: new Map(),
        depRunway: "",
        origin: "",
        destination: ""
    }
}

const sideButtons = {
    reset: function () {
        sideButtons.left = {
            button1: {
                func: function() {
                    console.log("Pressed Button 1L")
                }
            },
            button2: {
                func: function () {
                    console.log("Pressed Button 3L")
                }
            },
            button3: {
                func: function () {
                    console.log("Pressed Button 3L")
                }
            },
            button4: {
                func: function () {
                    console.log("Pressed Button 4L")
                }
            },
            button5: {
                func: function () {
                    console.log("Pressed Button 5L")
                }
            },
            button6: {
                func: function () {
                    console.log("Pressed Button 6L")
                }
            }
        }
        sideButtons.right = {
            button1: {
                func: function () {
                    console.log("Pressed Button 1R")
                }
            },
            button2: {
                func: function () {
                    console.log("Pressed Button 3R")
                }
            },
            button3: {
                func: function () {
                    console.log("Pressed Button 3R")
                }
            },
            button4: {
                func: function () {
                    console.log("Pressed Button 4R")
                }
            },
            button5: {
                func: function () {
                    console.log("Pressed Button 5R")
                }
            },
            button6: {
                func: function () {
                    console.log("Pressed Button 6R")
                }
            }
        }
    },
    left:{
        button1: {
            func: function(){
                console.log("Pressed Button 1L")
            }
        },
        button2: {
            func: function () {
                console.log("Pressed Button 3L")
            }
        },
        button3: {
            func: function () {
                console.log("Pressed Button 3L")
            }
        },
        button4: {
            func: function () {
                console.log("Pressed Button 4L")
            }
        },
        button5: {
            func: function () {
                console.log("Pressed Button 5L")
            }
        },
        button6: {
            func: function () {
                console.log("Pressed Button 6L")
            }
        }
    },
    right: {
        button1: {
            func: function () {
                console.log("Pressed Button 1R")
            }
        },
        button2: {
            func: function () {
                console.log("Pressed Button 3R")
            }
        },
        button3: {
            func: function () {
                console.log("Pressed Button 3R")
            }
        },
        button4: {
            func: function () {
                console.log("Pressed Button 4R")
            }
        },
        button5: {
            func: function () {
                console.log("Pressed Button 5R")
            }
        },
        button6: {
            func: function () {
                console.log("Pressed Button 6R")
            }
        }
    }
}

const IFC  = require('ifc-evolved');
//const IFC = require('/Users/samneale/Documents/codeProjects.nosync/ifc-evolved/ifc.js');
IFC.enableLog = true;
IFC.init(
    function (initData) {
        console.log("IFC connected");
        infiniteFlightData.connected = true;
        infiniteFlightData.device = initData.DeviceName;
        infiniteFlightData.version = initData.Version.split('.')[0] + "." + initData.Version.split('.')[1];
        infiniteFlightData.vehicle.aircraft = initData.Aircraft;
        infiniteFlightData.vehicle.livery = initData.Livery;
        setTimeout(() => {
            IFC.getAirplaneState((data) => {
                console.log(data)
            })
        }, 5000);
        //IFC.sendCommand({ "Command": "Commands.FlapsDown", "Parameters": [] });

    },
    function () {
        infiniteFlightData.connected = null;
        IFC.log("IFC connection error");
    }
)