var clear = require('clear');

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

class Tile {
  constructor() {
    this.hasMine = null;
    this.flagged = false;
    this.count   = 0;
    this.exposed = false;
  }

  toggleFlag() {
    this.flagged = !this.flagged;
  }

  toString() {
    if (this.exposed) {
      if (this.hasMine) {
        return '💥 ';
      } else if (this.count > 0) {
        return String(this.count) + ' ';
      }
      return '  ';
    } else {
      if (this.flagged) {
        return '⚑ ';
      } else {
        return '- ';
      }
      return '- ';
    }
  }
}

class Minesweeper {
  constructor(length = 9, width = 10, difficulty = 10) {
    this.length = length;
    this.width = width;
    this.board = [];
    this.difficulty = difficulty;
    this.status = 'open';

    for (let i = 0; i < length; i++) {
      var cols = [];
      for (let j = 0; j < width; j++) {
        var tile = new Tile();
        if (Math.random() <= this.difficulty / 100) {
          tile.hasMine = true;
        }
        cols.push(tile);
      }
      this.board.push(cols);
    }

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < width; j++) {
        var current = this.board[i][j];

        if (!current.hasMine) {
          continue;
        }

        var mark = (i,j) => {
          if (this.board[i] && this.board[i][j]) {
            this.board[i][j].count++;
          }
        };

        mark(i - 1, j - 1);
        mark(i - 1, j);
        mark(i - 1, j + 1);
        mark(i, j - 1);
        mark(i, j + 1);
        mark(i + 1, j - 1);
        mark(i + 1,j);
        mark(i + 1,j + 1);
      }
    }
  }

  show() {
    clear();

    var description = `Minesweeper v1.0.0\n\nTo play use [C|F][row][col]. 'C': clear, 'F': flag. E.g. C5b\n\n`;

    process.stdout.write("\n");
    process.stdout.write(description);
    process.stdout.write("  ");
    var char = 'a';
    for (var i = 0; i < this.width; i++) {
      process.stdout.write(char + ' ');
      char = String.fromCharCode(char.charCodeAt(0) + 1);
    }
    process.stdout.write("\n");

    for (i = 0; i < this.length; i++) {
      process.stdout.write(String(i + 1) + ' ');
      for (var j = 0; j < this.width; j++) {
        process.stdout.write(this.board[i][j].toString());
      }
      process.stdout.write("\n");
    }
    return this;
  }

  flag(i, j) {
    if (!this.board[i] || !this.board[i][j]) {
      return this;
    }

    if (this.board[i][j].exposed) {
      return this;
    }

    this.board[i][j].toggleFlag();
    return this;
  }

  click(i, j) {
    if (!this.board[i] || !this.board[i][j]) {
      return this;
    }

    if (this.board[i][j].hasMine) {
      this.status = 'lost';
      return this;
    }

    return this.expose(i,j);
  }

  exposeAll() {
    for(let i = 0; i < this.length; i++) {
      for (let j = 0; j < this.width; j++) {
        this.board[i][j].exposed = true;
      }
    }
    return this;
  }

  expose(i, j) {
    if (!this.board[i] || !this.board[i][j]) {
      return this;
    }

    var tile = this.board[i][j];
    if (tile.exposed) {
      return this;
    }

    tile.exposed = true;

    if (tile.count > 0) {
      return this;
    }

    this.expose(i - 1, j - 1);
    this.expose(i - 1, j);
    this.expose(i - 1, j + 1);
    this.expose(i, j - 1);
    this.expose(i, j + 1);
    this.expose(i + 1, j - 1);
    this.expose(i + 1, j + 1);
    this.expose(i + 1, j);
    return this;
  }

  getStatus() {
    if (this.status === 'lost' || this.status === 'won') {
      return this.status;
    }

    this.status = 'won';

    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < this.width; j++) {
        var tile = this.board[i][j];
        if (!tile.exposed && !tile.hasMine) {
          this.status = 'open';
        }
      }
    }

    return this.status;
  }

  move(move, row, col) {
    if (move === 'c') {
      this.click(row, col);
    } else if (move === 'f') {
      this.flag(row, col);
    }
    return this.show();
  }

  play() {
    this.show();
    var self = this;

    rl.setPrompt("\nMove? ");
    rl.prompt();
    return rl.on('line', function(line){
      var [move, row, col] = line.toLowerCase().split('');

      if (move !== 'c' && move !== 'f') {
        self.show();
        rl.prompt();
        return;
      }

      row = row -1;
      col = col.charCodeAt(0) - 'a'.charCodeAt(0);
      self.move(move, row, col);

      var status = self.getStatus();

      if (status === 'won') {
        self.exposeAll().show();
        process.stdout.write("You won!!\n");
        rl.close();
      } else if (status === 'lost') {
        self.exposeAll().show();
        process.stdout.write(`\n\nSomebody set up us the bomb.\n All your base are belong to us.\n\n`);
        rl.close();
      } else {
        rl.prompt();
      }
    });
  }
}

new Minesweeper().play();
