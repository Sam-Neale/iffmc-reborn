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
            default:
                console.error("Unknown Value");
                break;
        }
    }else if(type == "function-left"){
        display.sideButtons.left[`btn${value + 1}`].func();
    }else if (type == "function-right"){
        display.sideButtons.right[`btn${value + 1}`].func();
    }else if(type == "num"){
        if(value == "INVERT"){

        }else{
            SPData += value;
        }
    }else if(type == "char"){
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
        displayCTX.lineTo(1000, 660);
        displayCTX.stroke();
        if(SPError == true){
            displayCTX.fillStyle = '#FF1111';
        }else{
            displayCTX.fillStyle = '#FFFFFF';
        }
        displayCTX.fillText(SPData, 20, 740);
        displayCTX.fillStyle = '#FFFFFF';
        programData.renderProgram();
        //Pages
    let program = programData.programs[programData.programs.current];
    let page = program.pages[program.pages.current];
    if(page.pPage != null){
        displayCTX.fillText("<" + page.pPage[0], 20, 695);
    }
    if(page.nPage != null){
        displayCTX.textAlign = 'right';
        displayCTX.fillText(page.nPage[0] + ">", 980, 695);
        displayCTX.textAlign = 'left';
    }

        
}

setInterval(renderDisplay, 100);

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
                        displayCTX.fillText("IF Version", 985, 215);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.version, 985, 265);
                    //Device
                        //Header
                        displayCTX.font = "bold 25px Courier New";
                        displayCTX.fillText("Device", 985, 320);
                        //Value
                        displayCTX.font = "normal 35px Courier New";
                        displayCTX.fillText(infiniteFlightData.device, 985, 370);
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
                    displayCTX.fillText("Disconnected", 15, 160);
                }
            },
            pages: {
                current: 'page1',
                page1: {
                    nPage: null,
                    pPage: null,
                }
            }
        }
    },
    renderProgram: function(){
        programData.programs[programData.programs.current].render();
    }
}

const infiniteFlightData = {
    connected: false,
    version: "0.0",
    device: "Unknown",
    vehicle:{
        aircraft: "",
        livery: ""
    }
}

const { infiniteFlight } = require('ifc-evolved');
const IFC = require('/Users/samneale/Documents/codeProjects.nosync/ifc-evolved/ifc.js');
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