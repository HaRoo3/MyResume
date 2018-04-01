

function canvasApp(){


  var theCanvas = document.getElementById("canvas");
  var context = theCanvas.getContext("2d");
var CanvasAutoResize = {
  draw: function() {
    //var ctx = document.getElementById('canvas').getContext('2d');
    //var canvasContainer = document.getElementById('canvas-container');
    context.canvas.width  = document.body.scrollWidth-2;
    context.canvas.height = document.body.scrollHeight-2;
  },

  initialize: function(){
    var self = CanvasAutoResize;
    self.draw();
    $(window).on('resize', function(event){
      self.draw();
    });
  }
}
  //應用程式狀態
  const GAME_STATE_TITLE = 0;
  const GAME_STATE_NEW_GAME = 1;
  const GAME_STATE_NEW_LEVEL = 2;
  const GAME_STATE_PLAYER_START = 3;
  const GAME_STATE_PLAY_LEVEL = 4;
  
  var currentGameState = 0;
  var currentGameStateFunction = null;

  //比賽場地
  var xMin = 0;
  var xMax = document.body.scrollWidth;
  var yMin = 0;
  var yMax = document.body.scrollHeight;


  //建立物件與陣列
  var player = {};
  var rocks = [];
  var particles = [];

  function switchGameState(newState){
    currentGameState = newState;
    switch(currentGameState){
      case GAME_STATE_TITLE:
        currentGameStateFunction = gameStateTitle;
        break;
      case GAME_STATE_NEW_GAME:
        currentGameStateFunction = gameStateNewGame;
        break;
      case GAME_STATE_NEW_LEVEL:
        currentGameStateFunction = gameStateNewLevel;
        break;
      case GAME_STATE_PLAYER_START:
        currentGameStateFunction = gameStatePlayerStart;
        break;
      case GAME_STATE_PLAY_LEVEL:
        currentGameStateFunction = gameStatePlayLevel;
        break;
    }
  }

  function gameStateTitle(){
    switchGameState(GAME_STATE_NEW_GAME);
  }

  function fillBackground(){
    //繪製背景
    context.fillStyle = '#000000';
    context.fillRect(xMin,yMin,xMax,yMax);
  }

  function gameStateNewGame(){
    //建置新遊戲
    level = 0;
    resetPlayer();
    switchGameState(GAME_STATE_NEW_LEVEL);
  }

  function gameStatePlayerStart(){
    fillBackground();
    if(player.alpha < 1){
      player.alpha = 1;
    }else{
      switchGameState(GAME_STATE_PLAY_LEVEL);
    }
    context.globalAlpha = 1;
    updateRocks();
    renderRocks();
  }

  function gameStateNewLevel(){
    rocks = [];
    particles = [];
    level = 10;
    levelRockMaxSpeedAdjust = level*.25;
    if(levelRockMaxSpeedAdjust > 3){
      levelRockMaxSpeed = 3;
    }

    levelSaucerMax = 1+Math.floor(level/10)

    if(levelSaucerMax > 5){
      levelSaucerMax = 5;
    }
    levelSaucerOccurrenceRate = 10+3*level;
    if(levelSaucerOccurrenceRate > 35){
      levelSaucerOccurrenceRate = 35;
    }
    levelSaucerSpeed = 1+.5*level;
    if(levelSaucerSpeed > 5){
      levelSaucerSpeed = 5;
    }
    levelSaucerFireDelay = 120-10*level;
    if(levelSaucerFireDelay < 20){
      levelSaucerFireDelay = 20;
    }
    levelSaucerFireRate = 20 +3*level;
    if(levelSaucerFireRate < 50){
      levelSaucerFireRate = 50;
    }
    levelSaucerMissileSpeed = 1+.2*level;
    if(levelSaucerMissileSpeed > 4){
      levelSaucerMissileSpeed = 4;
    }
    //建立岩石的級數
    for(var newRockctr=0;newRockctr<level+3;newRockctr++){
      var newRock = {};
      newRock.scale = 1;
      //規模 1=大 2=中 3=小
      //這些將被用作新尺寸的除數
      //50/1=50 50/2=25 50/3=16
      newRock.width = 50;
      newRock.height = 50;
      newRock.halfHeight = 25;
      newRock.halfWidth = 25;

      //開始所有新岩石位置
      newRock.x = Math.floor(Math.random()*1000);
      newRock.y = Math.floor(Math.random()*1000);
      
      newRock.dx = (Math.random()*2)+levelRockMaxSpeedAdjust;
      if(Math.random()<.5){
        newRock.dx*=-1;
      }

      newRock.dy = (Math.random()*2)+levelRockMaxSpeedAdjust;
      if(Math.random()<.5){
        newRock.dy*=-1;
      }

      //旋轉速度和方向
      newRock.rotationInc = (Math.random()*5)+1;

      if(Math.random()<.5){
        newRock.rotationInc*=-1;
      }
      newRock.rotation = 0;
      rocks.push(newRock);

    }
    resetPlayer();
    switchGameState(GAME_STATE_PLAYER_START);
  }

  function render(){
    fillBackground();
    renderRocks();
    renderParticles();
  }

  function update(){
    updateRocks();
    updateParticles();
  }

  function gameStatePlayLevel(){
    render();
    update();
    checkCollisions();
    checkForEndOfLevel();
    //frameRateCounter.countFrames();
  }

  function renderRocks(){
    var tempRock = {};
    var rocksLength = rocks.length-1;
    for(var rockCtr = rocksLength;rockCtr>=0;rockCtr--){
      tempRock = rocks[rockCtr];
      var angleInRadians = tempRock.rotation * Math.PI / 180;
      context.save();//將目前的狀態存入堆疊中
      context.setTransform(1,0,0,1,0,0);//重新設定

      //移動canvas的起始點到玩家的中心
      context.translate(tempRock.x+tempRock.halfWidth,tempRock.y+tempRock.halfHeight);
      context.rotate(angleInRadians);
      context.strokeStyle = '#ffffff';

      context.beginPath();
      
      //繪製二分之一偏移的所有事物
      //如果0.5*寬-1，0相對於二分之一，高度亦同
      context.moveTo(-(tempRock.halfWidth-1),-(tempRock.halfHeight-1));
      context.lineTo((tempRock.halfWidth-1),-(tempRock.halfHeight-1));
      context.lineTo((tempRock.halfWidth-1),(tempRock.halfHeight-1));
      context.lineTo(-(tempRock.halfWidth-1),(tempRock.halfHeight-1));
      context.lineTo(-(tempRock.halfWidth-1),-(tempRock.halfHeight-1));

      context.stroke();
      context.closePath();
      context.restore();//畫面呈現舊的畫面
    }
  }

  function updateRocks(){
    var tempRock = {};
    var rocksLength = rocks.length-1;
    
    for(var rockCtr=rocksLength;rockCtr>=0;rockCtr--){
      
      tempRock = rocks[rockCtr];
      tempRock.x += tempRock.dx;
      tempRock.y += tempRock.dy;
      tempRock.rotation += tempRock.rotationInc;
      //邊緣判定
      if(tempRock.x >xMax){
        tempRock.x =xMin-tempRock.width;
      }else if(tempRock.x<xMin-tempRock.width){
        tempRock.x = xMax;
      }
      if(tempRock.y >yMax){
        tempRock.y =yMin-tempRock.height;
      }else if(tempRock.y<yMin-tempRock.height){
        tempRock.y = yMax;
      }
    }
  }

  function renderParticles(){
    var tempParticle = {};
    var particleLength = particles.length-1;
    for(var particleCtr=particleLength;particleCtr>=0;particleCtr--){
      tempParticle = particles[particleCtr];
      context.save();//將目前的狀態存入堆疊中
      context.setTransform(1,0,0,1,0,0);//重新設定
       //移動canvas的起始點到玩家的中心
      context.translate(tempParticle.x,tempParticle.y);
      context.strokeStyle = '#ffffff';
      context.beginPath();
      //繪製二分之一偏移的所有事物，相對二分之一是15
      context.moveTo(0,0);
      context.lineTo(1,1);
      context.stroke();
      context.closePath();
      context.restore();//畫面呈現舊的畫面
    }

}

  function updateParticles(){
    var tempParticle = {};
    var particleLength = particles.length-1;
    for(var particleCtr=particleLength;particleCtr>=0;particleCtr--){
      var remove = false;
      tempParticle = particles[particleCtr];
      tempParticle.x += tempParticle.dx;
      tempParticle.y += tempParticle.dy;

      tempParticle.lifeCtr++;
      
      if(tempParticle.lifeCtr > tempParticle.life){
        remove = true;
      }else if((tempParticle.x > xMax) || (tempParticle.x < xMin) || (tempParticle.y > yMax) || (tempParticle.y < yMin)){
        remove = true;
      }
      if(remove){
        particles.splice(particleCtr,1);
        tempParticle = null;
      }
    }
  }
//碰撞判定
      function checkCollisions(){




} 

  function boundingBoxCollide(object1, object2){
    var left1 = object1.x;
    var left2 = object2.x;
    var right1 = object1.x + object1.width;
    var right2 = object2.x + object2.width;
    var top1 = object1.y;
    var top2 = object2.y;
    var bottom1 = object1.y + object1.height;
    var bottom2 = object2.y + object2.height;

    if(bottom1 < top2) return(false);
    if(top1 > bottom2) return(false);

    if(right1 < left2) return(false);
    if(left1 > right2) return(false);

    return(true);
  };

  //爆炸效果
  function creatExplode(x,y,num){
    //建立10個顆粒
    for(var partCtr=0;partCtr<num;partCtr++){
      var newParticle = new Object();
      newParticle.dx = Math.random()*3;
      if(Math.random()<.5){
        newParticle.dx*=-1;
      }
      newParticle.dy = Math.random()*3;
      if(Math.random()<.5){ 
        newParticle.dy*=-1;
      }
      newParticle.life = Math.floor(Math.random()*30+30);
      newParticle.lifeCtr = 0;
      newParticle.x = x;
      newParticle.y = y;
      particles.push(newParticle);
    }
  }

  function splitRock(scale,x,y){
    for(var newRockctr=0;newRockctr<2;newRockctr++){
      var newRock = {};

      if(scale==2){
        
        newRock.width = 25;
        newRock.height = 25;
        newRock.halfWidth = 12.5;
        newRock.halfHeight = 12.5;
      }else{
        
        newRock.width = 16;
        newRock.height = 16;
        newRock.halfWidth = 8;
        newRock.halfHeight = 8;
      }
      newRock.scale = scale;
      newRock.x = x;
      newRock.y = y;
      newRock.dx = Math.random()*3;
      if(Math.random()<.5){
        newRock.dx*=-1;
      }
      newRock.dy = Math.random()*3;
      if(Math.random()<.5){
        newRock.dy*=-1;
      }
      newRock.rotationInc = (Math.random()*5)+1;
      if(Math.random()<.5){
        newRock.rotationInc*=-1;
      }
      newRock.rotation = 0;
      rocks.push(newRock);
    }
  }


  function resetPlayer(){
    player.rotation = 270;
    player.x = .5*xMax;
    player.y = .5*yMax;
    player.facingX = 0;
    player.facingY = 0;
    player.movingX = 0;
    player.movingY = 0;
    player.alpha = 0;
    player.missileFrameCount = 0;
  }

 

  

  function checkForEndOfLevel(){
    if(rocks.length==0){
      switchGameState(GAME_STATE_NEW_LEVEL);
    }
  }



  function runGame(){
    currentGameStateFunction();
  }

  
  //***程式開始
  switchGameState(GAME_STATE_TITLE);

  const FRAME_RATE = 40;
  var intervalTime = 1000/FRAME_RATE;
  setInterval(runGame, intervalTime);
  $(function(argument) {
    CanvasAutoResize.initialize();
  });
  
}

