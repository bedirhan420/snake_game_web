var s;
var scl = 15;
var food;
var gameOver = false;
var bestScore = 0;

function setup() {
  createCanvas(450, 450);
  s = new Snake();
  pickLocation();
  frameRate(10);

  // Retrieve best score from localStorage
  var storedBestScore = localStorage.getItem('snake_best_score');
  if (storedBestScore !== null) {
    bestScore = parseInt(storedBestScore);
  }
}

function restart() {
  if (gameOver) {
    s = new Snake();
    pickLocation();
    gameOver = false;
  }
}

function mousePressed() {
  restart();
}

function pickLocation() {
  var cols = floor(width / scl);
  var rows = floor(height / scl);
  food = createVector(floor(random(cols)), floor(random(rows)));
  food.mult(scl);

  // Respawn food if it spawns inside the snake
  for (var i = 0; i < s.tail.length; i++) {
    var pos = s.tail[i];
    if (food.x === pos.x && food.y === pos.y) {
      pickLocation();
      break;
    }
  }
}

function saveScore(score) {
  // Retrieve previous scores from localStorage
  var scores = JSON.parse(localStorage.getItem('snake_scores')) || [];
  
  // Add current score to scores array
  scores.push(score);
  
  // Sort scores array in descending order
  scores.sort((a, b) => b - a);
  
  // Keep only top 10 scores
  scores = scores.slice(0, 10);
  
  // Save scores back to localStorage
  localStorage.setItem('snake_scores', JSON.stringify(scores));
}

function updateBestScore(score) {
  if (score > bestScore) {
    bestScore = score;
    // Update best score in localStorage
    localStorage.setItem('snake_best_score', bestScore);
  }
}

function draw() {
  background(51);

  // Ekran gridi
  for (var x = 0; x < width; x += scl) {
    for (var y = 0; y < height; y += scl) {
      stroke(100);
      noFill();
      rect(x, y, scl, scl);
    }
  }

  if (!gameOver) {
    s.update();
    s.show();
    if (s.eat(food)) {
      pickLocation();
    }
    fill(255, 0, 100);
    rect(food.x, food.y, scl, scl);
  } else {
    // Save score to localStorage
    saveScore(s.tail.length);
    
    // Update best score
    updateBestScore(s.tail.length);
    
    // Display game over message and scores
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("GAME OVER", width / 2, height / 2 + 40);
    textSize(24);
    text("Score: " + s.tail.length, width / 2, height / 2);
    text("Best Score: " + bestScore, width / 2, height / 2 + 80);
  }

  // Sağ üst köşede skor olsun
  textAlign(RIGHT, TOP);
  textSize(20);
  fill(255);
  text("Score: " + s.tail.length, width - 10, 10);
}

window.addEventListener('keydown', function(event) {
  event.preventDefault();
  if (event.key === "Space") {
    restart();
  } else if (!gameOver) {
    if (event.key === "ArrowUp") {
      s.dir(0, -1); // Move up
    } else if (event.key === "ArrowDown") {
      s.dir(0, 1); // Move down
    } else if (event.key === "ArrowRight") {
      s.dir(1, 0); // Move right
    } else if (event.key === "ArrowLeft") {
      s.dir(-1, 0); // Move left
    }
  }
});

function Snake() {
  this.x = 0;
  this.y = 0;
  this.xSpeed = 0;
  this.ySpeed = 0;
  this.total = 0;
  this.tail = [];

  this.dir = function(x, y) {
    this.xSpeed = x;
    this.ySpeed = y;
  };

  this.update = function() {
    if (this.total > 0) {
      for (var i = 0; i < this.tail.length; i++) {
        var pos = this.tail[i];
        var d = dist(this.x, this.y, pos.x, pos.y);
        if (d < 1) {
          gameOver = true;
          break;
        }
      }
    }

    if (this.x >= width || this.x < 0 || this.y >= height || this.y < 0) {
      gameOver = true;
    }

    if (!gameOver) {
      if (this.total === this.tail.length) {
        for (var i = 0; i < this.tail.length - 1; i++) {
          this.tail[i] = this.tail[i + 1];
        }
      }
      this.tail[this.total - 1] = createVector(this.x, this.y);
      this.x += this.xSpeed * scl;
      this.y += this.ySpeed * scl;

      this.x = constrain(this.x, 0, width - scl);
      this.y = constrain(this.y, 0, height - scl);
    }
  };

  this.show = function() {
    fill(255);
    for (var i = 0; i < this.total; i++) {
      rect(this.tail[i].x, this.tail[i].y, scl, scl);
    }
    rect(this.x, this.y, scl, scl);
  };

  this.eat = function(pos) {
    var d = dist(this.x, this.y, pos.x, pos.y);
    if (d < 5) {
      this.total++;
      return true;
    }
    return false;
  };
}
