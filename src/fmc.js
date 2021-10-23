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

    }else if(type == "function-left"){
        display.sideButtons.left[`btn${value + 1}`].func();
    }else if (type == "function-right"){
        display.sideButtons.right[`btn${value + 1}`].func();
    }else if(type == "num"){

    }else if(type == "char"){

    }else{
        console.error("Unknown type");
    }
}

let display = {
    sideButtons: {
        left:{
            btn1:{
                desc: "Welcome to IFFMC",
                func: () =>{

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
                desc: "TEST",
                func: () => {
                    
                }
            }
        }
    }
}

const displayObject = document.getElementById('displayCanvas');
const displayCTX = displayObject.getContext('2d');

displayObject.width = 1000;
displayObject.height = 762.1704018421823;

//1.312042553191489

function render(){
    displayCTX.clearRect(0, 0, displayObject.width, displayObject.height);
    //Buttons
    displayCTX.font = '30px Courier New';
    displayCTX.fillStyle = '#00FF00';
    displayCTX.textAlign = 'left';
    //Left Side
        // BTN 1
        displayCTX.fillText(display.sideButtons.left.btn1.desc, 20, 105);
        // BTN 2
        displayCTX.fillText(display.sideButtons.left.btn2.desc, 20, 225);
        // BTN 3
        displayCTX.fillText(display.sideButtons.left.btn3.desc, 20, 335);
        // BTN 4
        displayCTX.fillText(display.sideButtons.left.btn4.desc, 20, 445);
        // BTN 5
        displayCTX.fillText(display.sideButtons.left.btn5.desc, 20, 560);
        // BTN 6
        displayCTX.fillText(display.sideButtons.left.btn6.desc, 20, 670);
    //Right Side
    displayCTX.textAlign = 'right';
        // BTN 1
        displayCTX.fillText(display.sideButtons.right.btn1.desc, 980, 105);
        // BTN 2
        displayCTX.fillText(display.sideButtons.right.btn2.desc, 980, 225);
        // BTN 3
        displayCTX.fillText(display.sideButtons.right.btn3.desc, 980, 335);
        // BTN 4
        displayCTX.fillText(display.sideButtons.right.btn4.desc, 980, 445);
        // BTN 5
        displayCTX.fillText(display.sideButtons.right.btn5.desc, 980, 560);
        // BTN 6
        displayCTX.fillText(display.sideButtons.right.btn6.desc, 980, 670);

}

setInterval(render, 100);