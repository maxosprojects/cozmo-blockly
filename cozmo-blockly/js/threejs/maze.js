
var Block = function(maze, x, y) {
  this.x = x;
  this.y = y;
  this.coords = {x: this.x, y: this.y};
  this.width = maze.blockWidth;
  this.height = maze.blockHeight;
  this.maze = maze;
  this.markerSize = [this.width, this.height].sort(function(a,b) {return a-b;})[0];
  this.occupied = false;
  this.ctx = maze.ctx;
  this.parent = undefined;
  this.children = [];
};

Block.prototype.hasChild = function(other) {
  return this.children.lastIndexOf(other) > -1;
};

Block.prototype.randomAvailableNeighbor = function() {
  var neighbors = this.availableNeighbors();
  return neighbors[Math.floor(Math.random() * neighbors.length)];
};

Block.prototype.neighbors = function() {
  if (this._neighbors) {
    return this._neighbors;
  }

  this._neighbors = [];
  if (this.x > 0) {
    this._neighbors.push(this.neighbor(-1, 0));
  }

  if (this.x < this.maze.hBlocks - 1) {
    this._neighbors.push(this.neighbor(1, 0));
  }

  if (this.y > 0) {
    this._neighbors.push(this.neighbor(0, -1));
  }

  if (this.y < this.maze.vBlocks - 1) {
    this._neighbors.push(this.neighbor(0, 1));
  }

  return this._neighbors;
};

Block.prototype.availableNeighbors = function() {
  var neighbors = this.neighbors();
  return neighbors.filter(function(n) {return !n.occupied;});
};

Block.prototype.neighbor = function(relX, relY) {
  var x = this.x + relX;
  var y = this.y + relY;
  if (x >= 0 && x < this.maze.hBlocks && y >= 0 && y < this.maze.vBlocks) {
    return this.maze.blocks[y][x];
  }
};

Block.prototype.connectTo = function(other) {
  this.children.push(other);
  other.parent = this;
};

Block.prototype.connectedTo = function(other) {
  if (other) {
    return this.parent === other || this.hasChild(other);
  } else {
    return false;
  }
};

Block.prototype.draw = function(drawCustomWallFunc) {
  // Draw top wall only for the border.
  if (!this.connectedTo(this.neighbor(0, -1)) && this.y == 0) {
    this.drawTopWall(drawCustomWallFunc);
  }

  if (!this.connectedTo(this.neighbor(0, 1))) {
    this.drawBottomWall(drawCustomWallFunc);
  }

  // Draw left wall only for the border.
  if (this.occupied && !this.connectedTo(this.neighbor(-1, 0)) && this.x == 0) {
    this.drawLeftWall(drawCustomWallFunc);
  }

  if (!this.connectedTo(this.neighbor(1, 0))) {
    this.drawRightWall(drawCustomWallFunc);
  }
};

Block.prototype.drawWall = function(x1, y1, x2, y2, drawCustomWallFunc) {
  if (typeof Code !== "undefined") {
    if (drawCustomWallFunc) {
      drawCustomWallFunc(x1, y1, x2, y2);
    } else {
      Code.addStaticModel('WALL_WOOD', x1 - 50, y1 - 50, x2 - 50, y2 - 50, 1, 3);
    }
  }
};

Block.prototype.drawTopWall = function(drawCustomWallFunc) {
  this.drawWall(this.x * this.width,
                this.y * this.height,
                (this.x + 1) * this.width,
                this.y * this.height,
                drawCustomWallFunc);
};

Block.prototype.drawBottomWall = function(drawCustomWallFunc) {
  this.drawWall(this.x * this.width,
                (this.y + 1) * this.height,
                (this.x + 1) * this.width,
                (this.y + 1) * this.height,
                drawCustomWallFunc);
};

Block.prototype.drawLeftWall = function(drawCustomWallFunc) {
  this.drawWall(this.x * this.width,
                this.y * this.height,
                this.x * this.width,
                (this.y + 1) * this.height,
                drawCustomWallFunc);
};

Block.prototype.drawRightWall = function(drawCustomWallFunc) {
  this.drawWall((this.x + 1) * this.width,
                this.y * this.height,
                (this.x + 1) * this.width,
                (this.y + 1) * this.height,
                drawCustomWallFunc);
};

var MazeGenerator = function(width, height, hBlocks, vBlocks) {
  this.width = width;
  this.height = height;
  this.hBlocks = hBlocks;
  this.vBlocks = vBlocks;
  this.blockWidth = this.width / this.hBlocks;
  this.blockHeight = this.height / this.vBlocks;
  this.finished = false;
  this.blocks = [];
  this.history = [];
  this.currentBlock = undefined;
  this.initBlocks();
};

MazeGenerator.prototype.initBlocks = function() {
  for (var y = 0; y < this.vBlocks; ++y) {
    var row = [];
    for (var x = 0; x < this.hBlocks; ++x) {
      row.push(new Block(this, x, y));
    }
    this.blocks.push(row);
  }
};

MazeGenerator.prototype.drawLoop = function() {
  while(!this.finished) {
    this.step();
  }
};

MazeGenerator.prototype.step = function() {
  var oldBlock = this.currentBlock;
  var currentBlock = this.currentBlock = this.chooseBlock();

  if (!currentBlock) {
    // oldBlock.draw();
    this.finished = true;
    return;
  }

  currentBlock.occupied = true;
  if (!currentBlock.inHistory) {
    this.history.push(currentBlock);
    currentBlock.inHistory = true;
  }

  if (oldBlock) {
    if (!oldBlock.hasChild(currentBlock) && currentBlock.parent === undefined) {
      oldBlock.connectTo(currentBlock);
    }
    // oldBlock.draw();
  }

  // currentBlock.draw();
};

MazeGenerator.prototype.chooseBlock = function() {
  if (this.currentBlock) {
    var n = this.currentBlock.randomAvailableNeighbor();
    if (n) {
      return n;
    } else {
      var b = this.history.pop();
      b && (b.inHistory = false);
      b = this.history.pop();
      b && (b.inHistory = false);
      return b;
    }
  } else {
    var x = Math.floor(Math.random() * this.hBlocks);
    var y = Math.floor(Math.random() * this.vBlocks);
    return this.blocks[y][x];
  };
};

MazeGenerator.prototype.renderMaze = function(drawCustomWallFunc) {
  for (var x = 0; x < this.hBlocks; x++) {
    for (var y = 0; y < this.vBlocks; y++) {
      this.blocks[x][y].draw(drawCustomWallFunc);
    }
  }
};
