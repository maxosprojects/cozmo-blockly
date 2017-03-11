# Cozmo Programming with Blockly

<a href="https://github.com/maxosprojects/cozmo-blockly/tree/master/gallery">Check out the gallery<br/><img src="https://github.com/maxosprojects/cozmo-blockly/raw/master/gallery/demo.jpg" width="400"/>
<img src="https://github.com/maxosprojects/cozmo-blockly/raw/master/gallery/3d.jpg" width="400"/></a>

## Features
All programming constructs are available to teach/learn basics of programming. 3D live visualization makes it a little more interesting. Cube rendering as any character (currently Minecraft mobs are supported) bumps interest even more. Physical interaction with objects and watching live how it is reflected in Cozmo's world should be even more engaging.

Currently with Cozmo you can do:
- basic actions (drive, turn, speak), the list will be extended with time
- "drive to coordinate" action
- add static objects (Cozmo will drive around them on "drive to coordinate" action)
- some animations
- cube tap events
- "cube been seen" condition
- "cube is visible" condition
- "distance to cube" statement for math or logical operators
- turning towards a cube
- setting lift height
- setting head angle
- picking up cubes
- placing cubes on the ground or on another cube
- enable "free will"

Improved security compared to Cozmo ScratchX extension:
- everything runs on your computer without third-party servers or scripts
- programs you save reside on your computer and have no links to third-party scripts in them - just plain Blockly XML programs

Some other features:
- can be rendered in a mobile browser and supports touch interaction (tested in iOS 10.2)
- 3D visualization of Cozmo and his environment - works in a desktop or mobile browser (tested in iOS 10.2)
- 3D visualization supports Anaglyph rendering - just toggle it and put on the red-cyan glasses and you're there, with Cozmo
- cubes in 3D visualization can be replaced with Minecraft mobs (and a couple of skins are available, see [examples](examples))
- static objects can be added (e.g. a wall) both to 3D visualization and to Cozmo world (Cozmo then plans path around it on "drive to coordinate" action)
- maze can be generated (each "maze" block generates maze only once and the maze is persisted with the program so the student can build a program to guide Cozmo through the maze)
- 3D visualization hides cubes that have not been observed since program start and makes cubes not visible at the moment semi-transparent
- view camera in the same browser tab (just another blockly tab) - available only when program is running
- program blocks (statements) are highlighted when being executed
- view your program translated into Python or XML AST

## How to run
1. Check out this repository with "git", or download it as a zip archive and unpack
2. Install prerequisites:
	* `pip3 install --user cozmo[camera]`
	* `pip3 install --user tornado ws4py`
	* it is highly recommended to install Node.js as described in [Security considerations](#security-considerations) section
3. Go to `server` folder
4. Start the server: `python3 server.py` (additionally, `-n <the future programmer's name>` can be supplied to set the default filename when saving/reloading programs - convenient on mobile devices)
5. Point your browser to `http://localhost:9090/cozmo/`
6. Build your program and run with the red `play` button in the top-right corner

If your program hangs, or you just want to stop it, click the stop button.

The last executed program will be stored in `.last` file for you to be able to reload it.
You can also save any program with any other name and load any previously saved programs.

## Security considerations
There are two modes of code execution: `secure` and `non-secure`.

`secure` mode requires installation of [Node.js](https://nodejs.org).
In that mode the code you create with Blockly and execute with the `play` button is sent as Blockly XML AST to the server and there translated to an actual Python code and executed.

After you download and install NodeJS go to the `nodejs` folder and run `npm install`. That would install all the modules that are required for that additional service.

`non-secure` mode doesn't require Node.js. In that mode your program is traslated into Python code and is sent to the server for execution.
This mode is intended for contained environments (e.g. in a home network).
The risk here is that the server accepts arbitrary code from the network for execution.
If you are not sure your local home network is secure, or if you're planning to let people with potentially malicious intentions program your Cozmo, or you're running `server.py` not in your local home network, it is highly recommended to run `server.py` in `secure` mode.

By default `server.py` runs in `secure` mode. To run it in `non-secure` mode use `--nonsecure` command argument.

## Developing
There are two Javascript versions: compressed and uncompressed.
Compressed version is compiled with google's closure library, is minified and obfuscated.
Uncompressed version is debuggable.

To run uncompressed version: `python3 server.py -d` which enables debug mode.
You may encounter some caching issues. If so, restart `server.py`

## Issues
Any issues? Report an issue above.

## Used by
[MEGAkid: Learn to Code the Cozmo Robot! Beginners: Ages 6-12](https://www.eventbrite.com/e/megakid-learn-to-code-the-cozmo-robot-beginners-ages-6-12-tickets-32429174534)
