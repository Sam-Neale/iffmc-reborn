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
        switch(value){
            case "EXEC":
                execFunction();
                break;
            case "FPLN":
                display.pages.current = "fpln";
                display.pages.renderPage();
                break;
            case "MENU":
                display.pages.current = "home";
                display.pages.renderPage();
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

    }else if(type == "char"){
        if(value == "DEL"){
            textDeleteFunction()
        }else if(value == "CLR"){
            textClearFunction()
        }else{
            textInputFunc(value)
        }
    }else{
        console.error("Unknown type");
    }
}

let display = {
    sideButtons: {
        left:{
            btn1:{
                /**
                 * @type {string|array}
                 */
                desc: "Welcome to IFFMC",
                func: () =>{

                }
            },
            btn2: {
                desc: "We are looking for IF Now",
                func: () => {

                }
            },
            btn3: {
                desc: "Standby",
                func: () => {

                }
            },
            btn4: {
                desc: "TEST",
                func: () => {

                }
            },
            btn5: {
                desc: "TEST",
                func: () => {

                }
            },
            btn6: {
                desc: "TEST",
                func: () => {
                }
            }
        },
        right: {
            btn1: {
                /**
                 * @type {string|array}
                 */
                desc: "TEST",
                func: () => {

                }
            },
            btn2: {
                desc: "TEST",
                func: () => {

                }
            },
            btn3: {
                desc: "TEST",
                func: () => {

                }
            },
            btn4: {
                desc: "TEST",
                func: () => {

                }
            },
            btn5: {
                desc: "TEST",
                func: () => {

                }
            },
            btn6: {
                desc: "TEST",
                func: () => {
                }
            }
        }
    },
    pages:{
        renderPage: function(){
            display.pages[display.pages.current].buttonConfig();
        },
        current: 'home',
        home: {
            buttonConfig: () =>{
                display.sideButtons.left.btn1.desc = "Awaiting Command";
                display.sideButtons.left.btn2.desc = "";
                display.sideButtons.left.btn3.desc = "";
                display.sideButtons.left.btn4.desc = "";
                display.sideButtons.left.btn5.desc = "";
                display.sideButtons.left.btn6.desc = "Reload";
                display.sideButtons.left.btn6.func = function () { window.location.reload() };
                display.sideButtons.right.btn1.desc = "";
                display.sideButtons.right.btn2.desc = "";
                display.sideButtons.right.btn3.desc = "";
                display.sideButtons.right.btn4.desc = "";
                display.sideButtons.right.btn5.desc = "";
                display.sideButtons.right.btn6.desc = "";
            }
        },
        fpln: {
            buttonConfig: () =>{
                display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0533ff" }, { text: data.flightPlan.origin.temp, fillStyle: "#FFFFFF" }]
                display.sideButtons.left.btn1.func = function(){
                    if (data.flightPlan.origin.selected == false) {
                    data.flightPlan.origin.selected = true;
                    textInputFunc = function(char){
                        data.flightPlan.origin.temp = data.flightPlan.origin.temp + char;
                        display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0597ff" }, { text: data.flightPlan.origin.temp, fillStyle: "#FFFFFF" }]
                    }
                    textDeleteFunction = function() {
                        data.flightPlan.origin.temp = data.flightPlan.origin.temp.slice(0, -1);
                        display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0597ff" }, { text: data.flightPlan.origin.temp, fillStyle: "#FFFFFF" }]
                    }
                    textClearFunction = function(){
                        data.flightPlan.origin.temp = "";
                        display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0597ff" }, { text: data.flightPlan.origin.temp, fillStyle: "#FFFFFF" }]
                    }
                    execFunction = function(){
                        data.flightPlan.origin.value = data.flightPlan.origin.temp;
                        data.flightPlan.origin.selected = false;
                        display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0533ff" }, { text: data.flightPlan.origin.temp, fillStyle: "#FFFFFF" }]
                        resetFunctions();
                    }
                    display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0597ff" }, { text: data.flightPlan.origin.temp, fillStyle: "#FFFFFF" }]
                    }else{
                        data.flightPlan.origin.temp = data.flightPlan.origin.value;
                        data.flightPlan.origin.selected = false;
                        resetFunctions()
                        display.sideButtons.left.btn1.desc = [{ text: "Origin:", fillStyle: "#0533ff" }, { text: data.flightPlan.origin.value, fillStyle: "#FFFFFF" }]
                    }
                }
                display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0533ff" }, { text: data.flightPlan.dest.temp, fillStyle: "#FFFFFF" }]
                display.sideButtons.right.btn1.func = function () {
                    if(data.flightPlan.dest.selected == false){
                        data.flightPlan.dest.selected = true;
                        textInputFunc = function (char) {
                            data.flightPlan.dest.temp = data.flightPlan.dest.temp + char;
                            display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0597ff" }, { text: data.flightPlan.dest.temp, fillStyle: "#FFFFFF" }]
                        }
                        textDeleteFunction = function () {
                            data.flightPlan.dest.temp = data.flightPlan.dest.temp.slice(0, -1);
                            display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0597ff" }, { text: data.flightPlan.dest.temp, fillStyle: "#FFFFFF" }]
                        }
                        textClearFunction = function () {
                            data.flightPlan.dest.temp = "";
                            display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0597ff" }, { text: data.flightPlan.dest.temp, fillStyle: "#FFFFFF" }]
                        }
                        execFunction = function () {
                            data.flightPlan.dest.value = data.flightPlan.dest.temp;
                            data.flightPlan.dest.selected = false;
                            display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0533ff" }, { text: data.flightPlan.dest.temp, fillStyle: "#FFFFFF" }]
                            resetFunctions();
                        }
                        display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0597ff" }, { text: data.flightPlan.dest.temp, fillStyle: "#FFFFFF" }]
                    }else{
                        data.flightPlan.dest.selected = false;
                        data.flightPlan.dest.temp = data.flightPlan.dest.value;
                        resetFunctions()
                        display.sideButtons.right.btn1.desc = [{ text: "Dest:", fillStyle: "#0533ff" }, { text: data.flightPlan.dest.value, fillStyle: "#FFFFFF" }]
                    }
                }
            }
        }
    }
}

const displayObject = document.getElementById('displayCanvas');
//@ts-ignore
const displayCTX = displayObject.getContext('2d');

//@ts-ignore
displayObject.width = 1000;
//@ts-ignore
displayObject.height = 762.1704018421823;

//1.312042553191489

const fillMixedText = (ctx, args, x, y, align) => {
    let defaultFillStyle = ctx.fillStyle;
    let defaultFont = ctx.font;
    let defaultTextAlign = ctx.textAlign;
    console.log(align || defaultTextAlign)
    ctx.save();
    args.forEach(({ text, fillStyle, font }) => {
        ctx.fillStyle = fillStyle || defaultFillStyle;
        ctx.font = font || defaultFont;
        ctx.fillText(text, x, y);
        ctx.textAlign = align || defaultTextAlign;
        x += ctx.measureText(text).width;
    });
    ctx.restore();
};

function renderButton(data, x, y){
    if(Array.isArray(data)){
        fillMixedText(displayCTX, data, x, y);
    }else{
        displayCTX.fillText(data, x, y);
    }
}

function renderScreen(){
    //@ts-ignore
    displayCTX.clearRect(0, 0, displayObject.width, displayObject.height);
    //Buttons
    displayCTX.font = '30px Courier New';
    displayCTX.fillStyle = '#00FF00';
    displayCTX.textAlign = 'left';
    //Left Side
        // BTN 1
        renderButton(display.sideButtons.left.btn1.desc, 20, 105);
        // BTN 2
        renderButton(display.sideButtons.left.btn2.desc, 20, 225);
        // BTN 3
        renderButton(display.sideButtons.left.btn3.desc, 20, 335);
        // BTN 4
        renderButton(display.sideButtons.left.btn4.desc, 20, 445);
        // BTN 5
        renderButton(display.sideButtons.left.btn5.desc, 20, 560);
        // BTN 6
        renderButton(display.sideButtons.left.btn6.desc, 20, 670);
    //Right Side
    displayCTX.textAlign = 'right';
        // BTN 1
        renderButton(display.sideButtons.right.btn1.desc, 980, 105);
        // BTN 2
        renderButton(display.sideButtons.right.btn2.desc, 980, 225);
        // BTN 3
        renderButton(display.sideButtons.right.btn3.desc, 980, 335);
        // BTN 4
        renderButton(display.sideButtons.right.btn4.desc, 980, 445);
        // BTN 5
        renderButton(display.sideButtons.right.btn5.desc, 980, 560);
        // BTN 6
        renderButton(display.sideButtons.right.btn6.desc, 980, 670);

}

setInterval(renderScreen, 100);


//IF
const IFC = require('/Users/samneale/Documents/codeProjects.nosync/ifc-evolved/ifc.js');

IFC.enableLog = true;

IFC.init( function (){
        display.sideButtons.left.btn2.desc = "We connected!";
        let count = 0;
        let dots = setInterval(() =>{
            if(count == 4){
                count = 1;
            }
            display.sideButtons.left.btn3.desc = "Standby" + ('.'.repeat(count));
            count++;
        }, 500);

        setTimeout(() => {
            clearInterval(dots);
            display.pages.renderPage()
        }, 2500);
    },function (){
        display.sideButtons = {
        left: {
            btn1: {
                desc: "Welcome to IFFMC",
                    func: () => {

                    }
            },
            btn2: {
                desc: "We were unable to connect to IF",
                    func: () => {

                    }
            },
            btn3: {
                desc: "Please check that IF is running",
                    func: () => {

                    }
            },
            btn4: {
                desc: "And the connect API is on.",
                    func: () => {

                    }
            },
            btn5: {
                desc: "Then reload the app:",
                    func: () => {

                    }
            },
            btn6: {
                desc: "CLICK TO RELOAD",
                    func: () => {
                        window.location.reload();
                    }
            }
        },
        right: {
            btn1: {
                desc: "TEST",
                    func: () => {

                    }
            },
            btn2: {
                desc: "TEST",
                    func: () => {

                    }
            },
            btn3: {
                desc: "TEST",
                    func: () => {

                    }
            },
            btn4: {
                desc: "TEST",
                    func: () => {

                    }
            },
            btn5: {
                desc: "TEST",
                    func: () => {

                    }
            },
            btn6: {
                desc: "OR CTL/CMD + R",
                    func: () => {
                        window.location.reload();
                    }
            }
        }
        }
    }
)



let data = {
    flightPlan: {
        origin: {
            selected: false,
            value: "",
            temp: ""
        },
        dest: {
            selected: false,
            value: "",
            temp: ""
        }
    }
}

let textInputFunc = function (char) {
    console.log(char);
}

let textDeleteFunction = function () {
    console.log("DELETED");
}

let textClearFunction = function () {
    console.log("CLEAR");
}
let execFunction = function () {
    console.log("EXEC");
}

function resetFunctions(){
    textInputFunc = function (char) {
        console.log(char);
    }

    textDeleteFunction = function () {
        console.log("DELETED");
    }

    textClearFunction = function () {
        console.log("CLEAR");
    }
    execFunction = function () {
        console.log("EXEC");
    }
}