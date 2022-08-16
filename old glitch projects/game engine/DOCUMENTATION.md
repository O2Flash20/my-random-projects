## Setup
Link or paste in the game engine script.
Add a div with the id "gameHolder". It is in here where all the elements for the game will be held.
Add the function setup(); to your code. This is required for it all to run.

### createCanvas(size);
Creates the background canvas on which your game will be displayed. There is a set aspect ratio of (3:2). The "size" input can be set to any value or decimal you wish. Size 1 is 300 pixels by 200 pixels. Sizes and values are always treated like they are on a size 3 canvas and converted later, meaning that games are completely scalable.

### createSprite(name, width, height)
Creates a new sprite with an identifier of "name", a width of "width", and a height of "height". The sprite gets added to the canvas at (0,0).

### goTo(name, x, y)
Moves the sprite with the identifier "name" to ("x","y"). **The bottom-left corner is (-450, -300) and the top-right corner is (450, 300). (0,0) centers the sprite in the canvas**.

### move(name, x, y)
Moves the sprite "name" by "x" and by "y".

### onKeyPressed(key, result);
When "key" is clicked, the function "result" happens.

### posX(name);
Gets the unscaled X position of a sprite (0 is centered on the middle of the canvas).

### posY(name);
Gets the unscaled Y position of a sprite (0 is centered on the middle of the canvas).

### touchingBorder(name, direction);
Returns true if the sprite is touching a border. "Direction" can be "x" or "y". If it is "x", it returns true only if the sprite is touching a vertical border. If it is "y", it returns true only if the sprite is touching a horizontal border.



#### setBackground(url);
Sets the background image of the canvas.

### setCostume(name, url, removeHitbox);
Sets the image which represents the sprite "name". If you enter removeHitbox "true", it will make the red box which marks the sprite's borders.

### show(name);
Shows a sprite (makes it opaque).

### hide(name);
Hides a sprite (makes it transparent).

### showVar(name, round);
Displays the variable "name" under your game. This is meant to make it easier to visualize your game as you are making it. If you want it to round the number of a variable, enter true as "round."

### playSound(url);
Plays the audio "url".

## Behind the scenes

### scale(input);
Scales a number according to the canvas size.

### unscale(input);
Unscales a number according to the canvas size.

### getOffset(name);
Gets the offset of a sprite as a scaled integer.

### cornersList(name)
Returns two arrays. They each contain the x, then y coordinates of the top left, then bottom right coordinates.