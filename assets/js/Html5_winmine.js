  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");

  var brickRowCount = 7;
  var brickColumnCount = 7;
  var brickWidth = 50;
  var brickHeight = 50;
  var brickPadding = 0.1;
  var brickOffsetTop = 30;
  var brickOffsetLeft = 120;

  var images = [];
  function preload() {
    for(var i = 0; i < arguments.length; i++) {
      images[i] = new Image();
      images[i].src = preload.arguments[i];
    }
  }

preload(
  "assets/img/Html5_winmine/0.bmp",
  "assets/img/Html5_winmine/1.bmp",
  "assets/img/Html5_winmine/2.bmp",
  "assets/img/Html5_winmine/3.bmp",
  "assets/img/Html5_winmine/4.bmp",
  "assets/img/Html5_winmine/5.bmp",
  "assets/img/Html5_winmine/6.bmp",
  "assets/img/Html5_winmine/7.bmp",
  "assets/img/Html5_winmine/8.bmp",
)
  var bricks = [];
  //陣列值
  for(c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(r=0; r<brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0 , status: 0 ,NoClick: true};
    }
  }

  var score = (brickRowCount-2)*(brickColumnCount-2);

  function drawBricks() {
    for(c=0; c<brickColumnCount; c++) {
      for(r=0; r<brickRowCount; r++) {
        var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
        var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
        if(c==0 || r==0 || c==brickColumnCount-1 || r==brickRowCount-1){
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = "#eee";
          ctx.fill();
          ctx.closePath();
        } else {
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = "#0095DD";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
  var BombCount = brickRowCount-1;
  function bomb() {
    for(i=0;i<BombCount;i++){
      var minNum = 1;
      var a = Math.floor(Math.random() * (BombCount - minNum)) + minNum;
      var b = Math.floor(Math.random() * (BombCount - minNum)) + minNum;

      brickX = bricks[a][b].x;
      if(bricks[a][b].status == 1){
        i--;

      }
      bricks[a][b].status = 1;
      brickY = bricks[a][b].y;
      ctx.beginPath();
      ctx.rect(brickX, brickY, brickWidth, brickHeight);
      ctx.fillStyle = "#FF3333";
      //ctx.fill();
      ctx.closePath();

    }
    score = score-BombCount;
  }

  //添加事件回應
  canvas.addEventListener('click', function(e){
    p = getEventPosition(e);
    reDraw(p,ctx);
  }, false);

  //得到點擊的座標
  function getEventPosition(ev){
      var x, y;
      if (ev.layerX || ev.layerX == 0) {
          x = ev.layerX;
          y = ev.layerY;
      }else if (ev.offsetX || ev.offsetX == 0) { // Opera
          x = ev.offsetX;
          y = ev.offsetY;
      }
      return {x: x, y: y};
  }


  //點擊顯示數字
  function reDraw(p,ctx){

    for(c=0; c<brickColumnCount; c++) {
      for(r=0; r<brickRowCount; r++) {
        if(bricks[c][r].NoClick == true){
        brickX = bricks[c][r].x;
        brickY = bricks[c][r].y;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#FF3333";
        //ctx.fill();
        ctx.closePath();
        if(c==0 || r==0 || c==brickColumnCount-1 || r==brickRowCount-1){

        }else {
          if(p && ctx.isPointInPath(p.x, p.y)){
            if(bricks[c][r].status == 1){
              ctx.beginPath();
              ctx.rect(brickX, brickY, brickWidth, brickHeight);
              ctx.fillStyle = "#FF3333";
              ctx.fill();
              ctx.closePath();
            alert('game over');
            document.location.reload();
          }else{
            //數炸彈
            var kokoBombCount = 0;
            for(i=c-1;i<=c+1;i++){
              for(j=r-1;j<=r+1;j++){
                if(bricks[i][j].status == 1){
                  kokoBombCount++;
                }
              }
              if(kokoBombCount>0){
                for(k = 0;k<=images.length;k++){
                  if(k == kokoBombCount){
                    ctx.drawImage(images[k],bricks[c][r].x,bricks[c][r].y);
                    if(bricks[c][r].NoClick == true){
                      score--;
                      bricks[c][r].NoClick = false;
                    }
                  }
                }
              }else{
                ctx.fillStyle='#FFF';
                ctx.beginPath();
                ctx.rect(brickX,brickY, brickWidth, brickHeight);
                ctx.fill();
                if(bricks[c][r].NoClick == true){
                  score--;
                  bricks[c][r].NoClick = false;
                }
              }
            }
          }
        }
      }
    }

  }
  }
  //if(bricks[c][r].NoClick == false){
    //score--;
  //}



  if(score == 0){
    alert("YOU WIN");
      document.location.reload();
  }
}

drawBricks();
bomb();
