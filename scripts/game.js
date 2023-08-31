let canvas = document.getElementById('id-canvas');
let context = canvas.getContext('2d');

//////////////////////////////////
// Classes
//////////////////////////////////
class WORM{
    constructor(){
        this.HEAD = 0;
        this.wormCoords = [{x: gameboardSize/2-1,y: gameboardSize/2-1}];
        this.direction = '';
        this.ateSomething = false;
        this.wormCounter = 2;
        this.score = 0;
    }    
};

class Score{
    constructor(dateObject,year,month,day,hour,minute,second,score,name,duration){
        this.dateObject = dateObject;
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.score = score;
        this.name = name;
        this.duration = duration;
    }
}

//////////////////////////////////
// Variables received from user interface
//////////////////////////////////
let gameboardSize = document.getElementById("gameBoardSize").value;
let numberOfObstacles = document.getElementById("numberOfObstacles").value;
let numberOfFood = document.getElementById("numberOfFood").value;
let snakeSpeed = document.getElementById("snakeSpeed").value;


//////////////////////////////////
// Variables to save things
//////////////////////////////////
let SCORES = [];
let HIGHSCORES = [];
let KEYSTROKES = [];
let OBSTACLES = [];
let FOOD = [];



//////////////////////////////////
// Game States
//////////////////////////////////
let runGame = false;
let firstRender = true;
let youLost = false;
let newHighScore = false;

//////////////////////////////////
// Save each direction into a variable
//////////////////////////////////
let UP = 'up';
let DOWN = 'down';
let LEFT = 'left';
let RIGHT = 'right';



let startGameTime = performance.now();
let refreshRate = 1000 / snakeSpeed;
let timeSinceLastRefresh = refreshRate;
let deltaX = canvas.width / gameboardSize;
let deltaY = canvas.height / gameboardSize;
let prevTime = performance.now();





let worm = new WORM();

//////////////////////////////////
// Gameplay Functions
//////////////////////////////////
function startGame(){
    runGame = true;
    firstRender = true;
    KEYSTROKES = [];
    startGameTime = performance.now();
}
function pauseGame(){
    runGame = false;
    KEYSTROKES = [];
}
function resumeGame(){
    runGame = true;
    if(youLost == true){
        return;
    }
    if(worm.direction == ""){
        worm.direction = RIGHT;
    }
}
function startNewGame(){
    runGame = false;
    firstRender = true;
    youLost = false;
    newHighScore = false;
    updateGameBoardSize();
    startGameTime = performance.now();
    updateObstacleAndFoodAmounts();
    updateSnakeSpeed();    
    KEYSTROKES = [];
    OBSTACLES = [];
    FOOD = [];
    initObstacles();
    initFOOD();
    worm = new WORM();
}
function gameOver(){
    let endGameTime = performance.now();
    let totalGameTime = Math.floor((endGameTime - startGameTime)/60000);
    let timeStamp = new Date();
    let name = document.getElementById("name").value;
    worm.name = name;
    let score = new Score(
        timeStamp,
        timeStamp.getFullYear(),
        timeStamp.getMonth(),
        timeStamp.getDay(),
        timeStamp.getHours(),
        timeStamp.getMinutes(),
        timeStamp.getSeconds(),
        worm.score,
        worm.name,
        totalGameTime,
    );
    SCORES.push(score);
    addToHighScores(score);
    youLost = true;
    pauseGame();
    printScoreList();
    printGameOver();
}
function addToHighScores(score){    
    if(HIGHSCORES.length == 0){
        HIGHSCORES.push(score);
        newHighScore = true;
    }else{
        for(let i=0; i<HIGHSCORES.length; i++){
            if(score.score >= HIGHSCORES[i].score){                
                HIGHSCORES.splice(i,0,score);
                newHighScore = true;
                break;
            }
        }
        if(HIGHSCORES.length < 3){
            HIGHSCORES.push(score);
            newHighScore = true;
        }
        if(HIGHSCORES.length > 3){
            HIGHSCORES.pop();
            return;
        }
    }
}


//////////////////////////////////
// Gameplay Updating Functions
//////////////////////////////////
function updateGameBoardSize(){
    let boardSize = document.getElementById("gameBoardSize").value;
    if(boardSize >= 8 && boardSize <= 1000 && boardSize%2 == 0){
        gameboardSize = boardSize;
        deltaX = canvas.width / gameboardSize;
        deltaY = canvas.height / gameboardSize;
    }else{
        alert("Board Size needs to be an even number. \n Max Board Size: 1000 \n Min Board Size: 8");
        document.getElementById("gameBoardSize").value = 50;
    }
}
function updateObstacleAndFoodAmounts(){
    let numObs = document.getElementById("numberOfObstacles").value;
    let numFood = document.getElementById("numberOfFood").value;

    // Get number of obstacles
    if(numObs < gameboardSize*gameboardSize-numFood-1){
        numberOfObstacles = numObs;
    }else{
        alert("Number of Obstacles can't exceed spaces on board.");

        document.getElementById("numberOfObstacles").value = 15;
    }

    // Get number of food
    if(numFood < gameboardSize*gameboardSize-numObs-1){
        numberOfFood = numFood;
    }else{
        alert("Number of Food can't exceed spaces on board.");

        document.getElementById("numberOfFood").value = 1;
    }
}
function updateSnakeSpeed(){
    snakeSpeed = document.getElementById("snakeSpeed").value;
    refreshRate = 1000 / snakeSpeed;
    timeSinceLastRefresh = refreshRate;
}

function printGameOver(){
    context.font="100pt Comic Sans MS";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText("Game Over", canvas.width/2, canvas.height/2);    
}

function printNewHighScore(){
    context.font="50pt Comic Sans MS";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText("New High Score!!", canvas.width/2, canvas.height/2);   
}

//////////////////////////////////
// Random Functions to Help with Gameplay
//////////////////////////////////
function getRandomCoord(){
    let xCoord = Math.floor(Math.random()*Math.floor(gameboardSize));
    let yCoord = Math.floor(Math.random()*Math.floor(gameboardSize));
    let coord = {x:xCoord, y:yCoord};
    return coord;
}

function deltaT (){
    let currentTime = performance.now();
    delta = (currentTime - prevTime);

    prevTime = currentTime;

    return delta;
}

function isNotOccupied(x, y){
    let notOccupied = true;

    for(let i = 0; i < OBSTACLES.length; i++){
        if(x == OBSTACLES[i].x && y == OBSTACLES[i].y){
            notOccupied = false;
        }
    }

    for(let i = 0; i < FOOD.length; i++){
        if(x == FOOD[i].x && y == FOOD[i].y){
            notOccupied = false;
        }
    }

    for(let i = 0; i < worm.wormCoords.length; i++){
        if(x == worm.wormCoords[i].x && y == worm.wormCoords[i].y){
            notOccupied = false;
        }
    }

    return notOccupied;
}

//////////////////////////////////
// Initialize Things
//////////////////////////////////

function initObstacles(){
    while(OBSTACLES.length < numberOfObstacles){
        
        let xCoord = Math.floor(Math.random()*Math.floor(gameboardSize));
        let yCoord = Math.floor(Math.random()*Math.floor(gameboardSize));
        
        if(OBSTACLES.length == 0){
            OBSTACLES.push({x:xCoord, y:yCoord});
        }

        if(isNotOccupied(xCoord,yCoord)){
            OBSTACLES.push({x:xCoord, y:yCoord});
        }
    }    
}

function initFOOD(){
    while(FOOD.length < numberOfFood){
        
        let xCoord = Math.floor(Math.random()*Math.floor(gameboardSize));
        let yCoord = Math.floor(Math.random()*Math.floor(gameboardSize));
        
        if(isNotOccupied(xCoord,yCoord)){
            FOOD.push({x:xCoord, y:yCoord});
        }
    }    
}

//////////////////////////////////
// Controls
//////////////////////////////////
function onKeyDown(e) {
    if (e.keyCode === KeyEvent.DOM_VK_LEFT) {
        if(worm.direction != RIGHT){
            addKeyStroke(LEFT);
            resumeGame();
        }
    }
    else if (e.keyCode === KeyEvent.DOM_VK_RIGHT) {
        if(worm.direction != LEFT){
            addKeyStroke(RIGHT);
            resumeGame();
        }
    }
    else if (e.keyCode === KeyEvent.DOM_VK_UP) {
        if(worm.direction != DOWN){
            addKeyStroke(UP);
            resumeGame();
        }
    }
    else if (e.keyCode === KeyEvent.DOM_VK_DOWN) {
        if(worm.direction != UP){
            addKeyStroke(DOWN);
            resumeGame();
        }
    }
}

function addKeyStroke(direction){
    KEYSTROKES.unshift(direction);
}

function getDirection(){
    if(KEYSTROKES.length > 0){
        return KEYSTROKES.pop();
    }else{
        return worm.direction;
    }
}

//////////////////////////////////
// Update Things
//////////////////////////////////
function updateWorm(){
    /////////////////////
    // Update Score
    /////////////////////
    worm.score = (worm.wormCoords.length - 1) * snakeSpeed;

    worm.direction = getDirection();

    /////////////////////
    // Update Direction
    /////////////////////
    if(worm.direction == UP){
        newHead = {'x': worm.wormCoords[worm.HEAD].x, 'y': worm.wormCoords[worm.HEAD].y - 1}
    }
    else if(worm.direction == DOWN){
        newHead = {'x': worm.wormCoords[worm.HEAD].x, 'y': worm.wormCoords[worm.HEAD].y + 1}
    }
    else if(worm.direction == RIGHT){
        newHead = {'x': worm.wormCoords[worm.HEAD].x + 1, 'y': worm.wormCoords[worm.HEAD].y}
    }
    else if(worm.direction == LEFT){
        newHead = {'x': worm.wormCoords[worm.HEAD].x - 1, 'y': worm.wormCoords[worm.HEAD].y}
    }
    worm.wormCoords.unshift(newHead);
}

function checkWorm(){
    /////////////////////
    // Check if hit wall
    /////////////////////
    if(worm.wormCoords[worm.HEAD].x == -1 || worm.wormCoords[worm.HEAD].x == gameboardSize || worm.wormCoords[worm.HEAD].y == -1 || worm.wormCoords[worm.HEAD].y == gameboardSize){
        gameOver();
        return;
    }

    /////////////////////
    // Check if hit obstacle
    /////////////////////
    for(let i = 0; i < OBSTACLES.length; i++){
        if(worm.wormCoords[worm.HEAD].x == OBSTACLES[i].x && worm.wormCoords[worm.HEAD].y == OBSTACLES[i].y){
            gameOver();
            return;
        }
    }

    /////////////////////
    // Check if hit self
    /////////////////////
    for(let i = 1; i < worm.wormCoords.length; i++){
        if(worm.wormCoords[worm.HEAD].x == worm.wormCoords[i].x && worm.wormCoords[worm.HEAD].y == worm.wormCoords[i].y){
            gameOver();
            return;
        }
    }

    /////////////////////
    // Check if ate food
    /////////////////////
    
    for(let j = 0; j < FOOD.length; j++){
        if(worm.wormCoords[worm.HEAD].x == FOOD[j].x && worm.wormCoords[worm.HEAD].y == FOOD[j].y){
            if(worm.ateSomething == true){
                worm.wormCounter += 3;
            }else{
                worm.ateSomething = true;
            }
            
            
            FOOD.splice(j,1);
            // Create new food item on gameboard
            initFOOD();
            break;
        }
    }

    if(worm.ateSomething == true){
        if(worm.wormCounter == 0){
            worm.ateSomething = false;
            worm.wormCounter = 2;
        }else{
            worm.wormCounter -= 1;
        }
    }else{
        // Remove tail if no food was eaten
        worm.wormCoords.pop();
    }

    

    
}

//////////////////////////////////
// Output to HTML
//////////////////////////////////
function updateOnScreenValues(){
    document.getElementById("currentScore").innerHTML = (worm.score);
}
function printScoreList(){

    let list = document.getElementById("scoreList");

    list.innerHTML = "";

    for(let i=0;i<HIGHSCORES.length;i++){

        let newList = document.createElement("li");

        newList.appendChild(document.createTextNode(
            "Name: "+
            HIGHSCORES[i].name
            +" || Score: "+
            HIGHSCORES[i].score 
            +" || Game Length: "+
            HIGHSCORES[i].duration +" min."
            
        ))
        
        list.appendChild(newList);
    }
}

//////////////////////////////////
// Render Things
//////////////////////////////////
function drawPixel(x, y, color, drawShadow) {

    x = Math.trunc(x);
    y = Math.trunc(y);

    context.fillStyle = color;
    context.strokeStyle = 'rgba(0, 0, 0, 1)';
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 20;
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY);

    /*if(drawShadow == true){
        context.save();
        context.rect(x * deltaX, y * deltaY, deltaX, deltaY);
        context.strokeStyle = 'rgba(0, 0, 0, 0)';
        context.fillStyle = color;
        context.shadowColor = 'rgba(0, 0, 0, 0.3)';
        context.shadowBlur = 20;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 2;
        context.fill();
        context.restore();
    }else{
        context.save();
        context.fillStyle = color;
        context.strokeStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY);
        context.restore();
    }*/

    


    
}
function clearScreen() {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();

    context.save();
    context.lineWidth = 0.00001;
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.beginPath();
    for (let y = 0; y <= gameboardSize; y++) {
        context.moveTo(1, y * deltaY);
        context.lineTo(canvas.width, y * deltaY);
    }
    for (let x = 0; x <= gameboardSize; x++) {
        context.moveTo(x * deltaX, 1);
        context.lineTo(x * deltaX, canvas.width);
    }
    context.stroke();
    context.restore();
}
function drawWorm(){
    for (let i = 0; i<worm.wormCoords.length;i++){
        let gradient = 1;
        let color = "rgba(39, 35, 36,";

        
        gradient -= i/(worm.wormCoords.length*2);

        

        color = color + gradient + ")";
        drawPixel(worm.wormCoords[i].x,worm.wormCoords[i].y, color,true);
    }
}
function drawObstacles(){
    for (let i = 0; i<OBSTACLES.length;i++){
        drawPixel(OBSTACLES[i].x,OBSTACLES[i].y, 'rgba(226, 205, 109,1)',true);
    }
}
function drawFood(){
    for (let i = 0; i<FOOD.length;i++){
        drawPixel(FOOD[i].x,FOOD[i].y, 'rgba(232, 111, 104,1)',false);
    }
}

//////////////////////////////////
// Game Loop
//////////////////////////////////
function update() {
    updateOnScreenValues();
    updateWorm();
    checkWorm();
}

function render() {
    clearScreen();
    drawWorm();
    drawFood();
    drawObstacles();
    if(youLost == true){
        if(newHighScore == true){
            printNewHighScore();
        }else{
            printGameOver();
        }
    }
    timeSinceLastRefresh = 0;
}

function gameLoop() {
    timeSinceLastRefresh += deltaT();

    if(firstRender == true){
        startNewGame();
        render();
        firstRender = false;
        timeSinceLastRefresh = 0;
    }

    if(timeSinceLastRefresh >= refreshRate){
        if(runGame == true && youLost != true){
            update();
        }

        render();
    }
    requestAnimationFrame(gameLoop);
}

//Event Listener
window.addEventListener('keydown', onKeyDown);


requestAnimationFrame(gameLoop);
