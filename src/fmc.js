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
                program.pages.current = page.pPage[1];
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
displayObject.height = 762.1704018421823;

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
        displayCTX.fillText(SPData, 20, 730);
        programData.renderProgram();
        //Pages
    let program = programData.programs[programData.programs.current];
    let page = program.pages[program.pages.current];
    if(page.pPage != null){
        displayCTX.fillText("<" + page.pPage[0], 20, 685);
    }
    if(page.nPage != null){
        displayCTX.textAlign = 'right';
        displayCTX.fillText(page.nPage[0] + ">", 980, 685);
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
    connected: false
}

const IFC = require('ifc-evolved');
IFC.init(
    function () {
        console.log("IFC connected");
        infiniteFlightData.connected = true;
        IFC.sendCommand({ "Command": "Commands.FlapsDown", "Parameters": [] });
    },
    function () {
        infiniteFlightData.connected = null;
        IFC.log("IFC connection error");
    }
)