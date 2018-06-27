var page = document.getElementById("page");
var c = page.getContext("2d");

// Resizing canvas with client window.
function resize() {
	page.width = window.innerWidth - 18;
	page.height = window.innerHeight - 18;
}

window.onresize = function(event) {
	rsz = true;
};
var rsz = false;
resize();
// Resizing canvas with client window.

// When the game started for time calculations.
var startTime = new Date().getTime();

// Card background image.
var card = new Image();
	card.src = 'Img/card.png';
	
drawEmptyCard = function(x, y) {
	c.drawImage(card, x, y);
}

var logo = new Image();
	logo.src = "Img/Logo.jpg"
// Drawing card to canvas.

// Is game over?
var running = true;

// All available cards in deck
var cards = [];

var gridSize = [4, 5],
	grid = new Array(gridSize[0]); // Grid of cards 4 wide
for (var i = 0; i < grid.length; i++) {
	grid[i] = new Array(gridSize[1]); // Each column is 5 tall
}

var sets = 0;

// Scaling down all the images (loss of image quality)
var scale = 3; // 1/3 resolution;
var offX = 400;
var offY = 50; // X and Y offset.

// All properties of cards: (+ Number of symbols)
var shapes = ["D", "S", "C"];
var cols = ["R", "G", "P"];
var fills = ["E", "S", "F"];

// 3^4 cards in a deck = 81 cards.
for (var s in shapes) {
	for (var cc in cols) {
		for (var f in fills) {
			for (var i = 1; i <= 3; i++) {
				cards.push(new Card(shapes[s], cols[cc], fills[f], i));
			}
		}
	}
}

// Card object.
function Card(shape, col, fill, num) {
	this.shape = shape;
	this.col = col;
	this.fill = fill;
	this.num = num;
	
	this.img = new Image();
	this.img.src = "Img/" + shape + col + fill + ".png";
	
	this.draw = function(x = 0, y = 0) {
		x = x * card.width * 1.1 + offX;
		y = y * card.height * 1.1 + offY;
		drawEmptyCard(x, y);
		if (this.num == 1) {
			c.drawImage(this.img, 
				x + card.width/2 - this.img.width/2/scale, 
				y + card.height/2 - this.img.height/2/scale,
				this.img.width/scale,
				this.img.height/scale
			);
		} else if (this.num == 2) {
			c.drawImage(this.img, 
				x + card.width/2 + this.img.width/2/scale * 0.25, 
				y + card.height/2 - this.img.height/2/scale,
				this.img.width/scale,
				this.img.height/scale
			);
			
			c.drawImage(this.img, 
				x + card.width/2 - this.img.width/2/scale * 2.25, 
				y + card.height/2 - this.img.height/2/scale,
				this.img.width/scale,
				this.img.height/scale
			);
		} else {
			c.drawImage(this.img, 
				x + card.width/2 + this.img.width/2/scale*1.5, 
				y + card.height/2 - this.img.height/2/scale,
				this.img.width/scale,
				this.img.height/scale
			);
			
			c.drawImage(this.img, 
				x + card.width/2 - this.img.width/2/scale * 3.5, 
				y + card.height/2 - this.img.height/2/scale,
				this.img.width/scale,
				this.img.height/scale
			);
			
			c.drawImage(this.img, 
				x + card.width/2 - this.img.width/2/scale, 
				y + card.height/2 - this.img.height/2/scale,
				this.img.width/scale,
				this.img.height/scale
			);
		}
	};
}
// Card object.

// Detecting which card the mouse is over.
var mx = -1, my = -1;
document.onmousemove = function(e) {
	if (!running) return;
	
	if ((e.pageX - 8 - offX) % (1.1 * card.width) > card.width) {
		if (my != -1) {
			mx = my = -1;
			redraw()
			return;
		}
		return;
	} else if ((e.pageY - 8 - offY) % (card.height * 1.1) > card.height) {
		if (my != -1) {
			mx = my = -1;
			redraw()
			return;
		}
		return;
	}
	mmx = Math.floor((e.pageX - 8 - offX) / (1.1 * card.width ));
	mmy = Math.floor((e.pageY - 8 - offY) / (1.1 * card.height));

	if (mmy == 4 && mmx == -1) {
		if (!hintBox) {
			hintBox = true;
			redraw();
		}
	} else if (hintBox) {
		hintBox = false;
		redraw();
	}
	
	try {
		if (grid[mmx][mmy] == null) {
			mx = my = -1;
			redraw();
			return;
		}
	} catch (err) {
		mx = my = -1;
		redraw();
		return;	
	}
	
	//console.log(mx + " " + mmx + " " + my + " " + mmy);
	if (mx != mmx || my != mmy) {
		if (mmx < 0 || mmx >= grid.length) { // Check if mouse is in bounds
			mx = -1; // If not, selected box is outside grid 
		} else {
			mx = mmx;
		} 
		
		if (mmy < 0 || mmy >= grid[0].length) {
			my = -1;
		} else {
			my = mmy;
		}
		redraw();
	}
}

var selected = []; // List of selected card positions.
document.onmouseup = function(e) {
	e.preventDefault();	
	if (hintBox) {
		getHint();
		redraw();
	}
	
	if (mx == -1 || grid[mx][my] == null) return;
	
	if (selected.length == 0) { // Trying to select cards.
		selected.push([mx, my]);
		redraw();
		return;
	}
	
	// else
	for (var i in selected) { // Deselecting chosen cards
		if (selected[i][0] == mx && selected[i][1] == my) {
			selected.splice(i, 1);
			redraw();
			return;
		}
	}
	
	if (selected.length >= 3) return;
	
	selected.push([mx, my]);
	
	if (selected.length == 3) {
		hints = [];
		getSelectedSet();
	}
}

document.addEventListener("keydown", function(e) {
	if (e.keyCode == 13) {
		getHint();
		redraw();		
	}
}, false);

getSelectedSet = function() {
	if (checkSelected()) {
		removeSelected();
		sets++;
		redraw();
	}
	selected = [];	
	
	if (!getHint(false)) {
		running = false;	
	}
}

// Checking if the selected are a set.
checkSelected = function() {
	var c0 = grid[selected[0][0]][selected[0][1]],
		c1 = grid[selected[1][0]][selected[1][1]],
		c2 = grid[selected[2][0]][selected[2][1]];
		
	return checkSet(c0, c1, c2);
}

// Checking if given set is valid
checkSet = function(c0, c1, c2) {	
	if (checkSetColour(c0, c1, c2)) {
		if (checkSetShape(c0, c1, c2)) {
			if (checkSetNumber(c0, c1, c2)) {
				if (checkSetFill(c0, c1, c2)) {
					return true;
				}
			}
		}
	}
	return false;
}

removeSelected = function() {
	if (cards.length >= 3) { // Replacing the cards
		var index = Math.floor(Math.random() * cards.length);
		grid[selected[0][0]][selected[0][1]] = cards[index];
		cards.splice(index, 1);
		
		index = Math.floor(Math.random() * cards.length);
		grid[selected[1][0]][selected[1][1]] = cards[index];
		cards.splice(index, 1);
		
		index = Math.floor(Math.random() * cards.length);
		grid[selected[2][0]][selected[2][1]] = cards[index];
		cards.splice(index, 1);
	} else if (cards.length == 2) {
		var index = Math.floor(Math.random() * cards.length);
		grid[selected[0][0]][selected[0][1]] = cards[index];
		cards.splice(index, 1);
		
		index = Math.floor(Math.random() * cards.length);
		grid[selected[1][0]][selected[1][1]] = cards[index];
		cards.splice(index, 1);
		
		grid[selected[2][0]][selected[2][1]] = null;
	} else if (cards.length == 1) {
		var index = Math.floor(Math.random() * cards.length);
		grid[selected[0][0]][selected[0][1]] = cards[index];
		cards.splice(index, 1);
		
		grid[selected[1][0]][selected[1][1]] = null;
		grid[selected[2][0]][selected[2][1]] = null;
	} else if (cards.length == 0) {
		grid[selected[0][0]][selected[0][1]] = null;
		grid[selected[1][0]][selected[1][1]] = null;
		grid[selected[2][0]][selected[2][1]] = null;
	}
}

checkSetShape = function(c0, c1, c2) {
	if (c0.shape == c1.shape && c1.shape == c2.shape) {
		return true;
	}
	
	if (c0.shape != c1.shape && c1.shape != c2.shape && c2.shape != c0.shape) {
		return true;
	}
	
	return false;
}

checkSetColour = function(c0, c1, c2) {
	if (c0.col == c1.col && c1.col == c2.col) {
		return true;
	}
	
	if (c0.col != c1.col && c1.col != c2.col && c2.col != c0.col) {
		return true;
	}
	
	return false;
}

checkSetFill = function(c0, c1, c2) {
	if (c0.fill == c1.fill && c1.fill == c2.fill) {
		return true;
	}
	
	if (c0.fill != c1.fill && c1.fill != c2.fill && c2.fill != c0.fill) {
		return true;
	}
	
	return false;
}

checkSetNumber = function(c0, c1, c2) {
	if (c0.num == c1.num && c1.num == c2.num) {
		return true;
	}
	
	if (c0.num != c1.num && c1.num != c2.num && c2.num != c0.num) {
		return true;
	}
	
	return false;
}

getGrid = function(index) {
	return grid[Math.floor(index / 5)][index % 5];
}

getGridPos = function(index) {
	return [Math.floor(index / 5), index % 5];
}

hints = []; // List of hint positions.
getHint = function(show) { // Checking for any available sets.
	if (show === undefined) show = true;
	for (var i = 0; i < grid.length * grid[0].length; i++) {
		
		var c0 = getGrid(i);
		if (c0 == null) continue; // Checking there is a card there.
		
		for (var j = 0; j < grid.length * grid[0].length; j++) {
			if (j <= i) continue; // If true, it has been tested
			
			var c1 = getGrid(j);
			if (c1 == null) continue; // If no card here, check next slot
			
			for (var l = 0; l < grid.length * grid[0].length; l++) {
				if (l <= j) continue; // No need to retest sets
				
				var c2 = getGrid(l);
				if (c2 == null) continue;
				
				console.log("Checking.");
				if (checkSet(c0, c1, c2)) { // Checking if set is valid...
					if (show) {
						//selected = [getGridPos(i), getGridPos(j), getGridPos(l)]
						//getSelectedSet();
						hints = [getGridPos(i), getGridPos(j)]; // Set hints.
					}
					console.log("finished.");
					return true;
				}
			}
		}
	}
	hints = [];
	redraw();
	console.log("No sets could be found... Game Over!")
	return false;
}

// Draw the select hover box when mouse is over a card.
drawBox = function(x, y, col) {
	c.fillStyle = col;
	
	c.beginPath();
	c.rect(
		x * 1.1 * card.width - 5  + offX, 
		y * 1.1 * card.height - 5 + offY, 
		card.width + 10, 
		card.height + 10
	);
	c.fill();
	c.closePath();
}

drawSelectBox = function() {
	if (mx != -1) {
		drawBox(mx, my, "rgba(0, 200, 100, 0.3)");
	}
	
	for (var i in selected) {
		drawBox(selected[i][0], selected[i][1], "rgba(255, 128, 0, 0.5)");
	}
	
	for (var i in hints) {
		drawBox(hints[i][0], hints[i][1], "rgba(255, 0, 246, 0.25)");
	}
}

hintBox = false;
drawHintBox = function() {
	c.fillStyle = "rgba(30, 30, 30, 0.4)";
	
	c.beginPath();
	c.rect(
		-1 * 1.1 * card.width - 5  + offX, 
		4 * 1.1 * card.height - 5 + offY, 
		card.width + 10, 
		card.height + 10
	);
	c.fill();
	c.closePath();
}

// Redraw all the screen's content
var tx = 40; // grid.length * 252 * 1.1 + 30 + offX;
var secs, time, mins;
redraw = function() {
	if (!running) return;
	c.clearRect(0, 0, page.width, page.height);
	
	c.beginPath();
	
	gradient = c.createLinearGradient(0, 0, page.width, 0);
	gradient.addColorStop("0", "rgb(0, 84, 150)"); // Special gradient
	gradient.addColorStop("0.5", "rgb(180, 180, 180)"); // effect as background, Fade
	gradient.addColorStop("1.0", "rgb(0, 84, 150)"); // black to white
	
	c.fillStyle = gradient; // Drawing background.
	c.fillRect(0, 0, page.width, page.height);
	
	c.drawImage(logo, 30, 50, 
		logo.width * 1.3, // Setting width and height 
		logo.height * 1.3 // of displayed image.
	);
	
	c.font = "50px Ariel";
	drawEmptyCard(-1 * card.width * 1.1 + offX,
		4 * card.height * 1.1 + offY);
	c.fillText("Hint", 
		-1 * card.width * 1.1 + offX + logo.width / 2 - 35, 
		4 * card.height * 1.1 + offY + logo.height / 2 + 30
	);
	if (hintBox) drawHintBox();
	
	// Calculating current time.
	time = Math.round((new Date().getTime() - startTime) / 1000);
	secs = time % 60;
	mins = Math.floor(time / 60);
	
	// Setting font
	c.font = "36px Old Standard TT";
	c.fillStyle = "white";
	
	// Time elapsed
	c.fillText(mins + " Mins " + secs + " Secs", tx - 10, 540);	
	// Sets you have
	c.fillText(sets + " - Sets", tx + 50, 435);
	// Cards left in the deck
	c.fillText(cards.length + " - Cards left", tx, 485);
	
	// Drawing text "box"
	c.strokeStyle = "white";
	c.lineWidth = "5";
	// The straight lines on top and bottom
	c.moveTo(-5, 560); 
	c.lineTo(250, 560);
	c.moveTo(-5, 400);
	c.lineTo(250, 400);
	// The rounded end
	c.arc(250, 480, 80, 3 * Math.PI / 2, Math.PI / 2);
	c.stroke();
	
	try { // Rendering all the cards.
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[0].length; y++) {
				if (grid[x][y] !== null) {
					grid[x][y].draw(x, y);
				}
			}
		}
	} catch (err) {}
	
	drawSelectBox();
	c.closePath();
}

setBoard = function() {
	for (var x = 0; x < grid.length; x++) {
		for (var y = 0; y < grid[0].length; y++) {
		var index = Math.floor(Math.random() * cards.length);
		grid[x][y] = cards[index];
		cards.splice(index, 1);
		}
	}
}
setBoard();

var i = 0;
var interval = setInterval(function() {	
	if (rsz) { // Resizing screen
		resize();
		rsz = false;
	}
	
	redraw();
	
	if (!running) {
		clearInterval(interval);
	}
}, 200);

setInterval(function() { // Drawing game over text.
	if (!running) {
		c.beginPath();
		c.font = "Bold 70px Ariel";
		c.fillStyle = "rgb(190, 40, 40)";
		c.fillText("Game", 20, 655);
		
		c.fillStyle = "rgb(190, 60, 60)";
		c.fillText("over!", 20, 715);
		
		c.strokeStyle = "orange";
		c.lineWidth = "5";
		
		// The straight lines on top and bottom
		c.moveTo(0, 735); 
		c.lineTo(200, 735);
		c.moveTo(0, 595);
		c.lineTo(200, 595);
		
		// The rounded end
		c.arc(200, 665, 70, 3 * Math.PI / 2, Math.PI / 2);
		c.stroke();
		c.closePath();
	}
}, 1000)