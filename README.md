# Cozmo Programming with Blockly

![Cozmo Programming with Blockly](https://github.com/maxosprojects/cozmo-blockly/raw/master/cozmo-blockly.png)

## Features
Most importantly, all programming constructs are available to teach/learn basics of programming.
Among them are:
- functions
- loops
- arithmetic
- logic
- conditions
- if/then/else
- etc

With Cozmo you can do:
- basic actions (drive, turn, speak), the list will be extended with time
- some animations
- cube tap events
- "cube seen" conditions
- picking up cubes
- placing cubes on the ground or on another cube

Some other features:
- blocks are highlighted when being executed
- view your program transled into Python or XML AST
- view Cozmo's camera (only when program is running)

## How to run
1. Check out this repository with "git" or download it as zip archive.
2. Install prerequisites:
	a. `pip3 install --user tornado`
	b. `pip3 install --cozmo[camera]`
3. Go to `server` folder
4. Start server: python3 server.py -n <the future programmer's name>
5. Point your browser to `http://localhost:9090/blockly/demos/cozmo/`
6. Build your program and run with the red play button in the top-right corner

If your program hangs, or you just want to stop it, click the stop button.

The last executed program will be stored in `.last` file for you to be able to reload it.
You can also save any program with any other name and load any previously saved programs.

## Security concerns
By default the program you build with the blocks is translated into python and sent to the `server.py` for execution.
This model is intended for contained environments (e.g. in a home network).
Later instructions will be added how to install `nodejs` and run additional service that will instead let `server.py` receive XML AST of your program, which would be much more secure.
If you're not sure if your network is secure, or if you're planning to let people with potentially malicious intentions program your Cozmo, don't use this yet and wait for the update.

## Developing
There are two Javascript versions: compressed and uncompressed.
Compressed version is compiled with google's closure library, is minified and obfuscated.
Uncompressed version is debuggable.

To run uncompressed version: `python3 server.py -d` which enables debug mode.
You may encounter some caching issues. If so, restart the server.

## Issues
Any issues? Report an issue above.
