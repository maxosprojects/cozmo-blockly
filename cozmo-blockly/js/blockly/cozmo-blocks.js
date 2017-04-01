/**
 * @fileoverview Cozmo blocks for Blockly.
 * @author maxosprojects
 */
'use strict';

goog.provide('Blockly.Blocks.cozmo');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.cozmo.HUE = 210;
Blockly.Blocks.cozmo.HUE2 = 118;

var cubes = {
  "1": {"src": "img/thumbnails/cube1.png", "width": 13, "height": 11, "alt": "#1"},
  "2": {"src": "img/thumbnails/cube2.png", "width": 13, "height": 11, "alt": "#2"},
  "3": {"src": "img/thumbnails/cube3.png", "width": 13, "height": 11, "alt": "#3"}
};

// A hack to prevent rendering degree symbol as it is flaky.
// This is done to make it easy to upgrade blockly (keep it intact).
Blockly.FieldAngle.prototype.setText = function(text) {
  Blockly.FieldAngle.superClass_.setText.call(this, text);
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  this.updateGraph_();
  // // Insert degree symbol.
  // if (this.sourceBlock_.RTL) {
  //   this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild);
  // } else {
  //   this.textElement_.appendChild(this.symbol_);
  // }
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

Blockly.Blocks['math_angle'] = {
  /**
   * Block for numeric angle value.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldAngle('0'), 'NUM');
    this.appendDummyInput()
        .appendField("°");
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setTooltip('An angle.');
  }
};

Blockly.Blocks['cozmo_on_start'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('on start, ')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'EXIT_AT_END');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("stop after last statement");
    this.setInputsInline(true);
    this.appendStatementInput("BODY");
    this.setColour(Blockly.Blocks.cozmo.HUE2);
    this.setTooltip('Executes the program on start');
  }
};

Blockly.Blocks['cozmo_set_cube_model'] = {
  init: function() {
    this.jsonInit({
      "message0": "Set %1 model on cube %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "MODEL",
          "options": [
            ["crate", "CRATE"],
            ["zombie", "ZOMBIE"],
            ["spiderman", "SPIDERMAN"]
          ]
        },
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "colour": Blockly.Blocks.cozmo.HUE2,
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};

Blockly.Blocks['cozmo_add_static_model'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Add')
        .appendField(new Blockly.FieldDropdown([
                      ["wood_wall", "WALL_WOOD"],
                      ["brick_wall", "WALL_BRICK"]
                     ]),
                     'MODEL');
    this.appendValueInput("X1")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("x1");
    this.appendValueInput("Y1")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y1");
    this.appendValueInput("X2")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("x2");
    this.appendValueInput("Y2")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y2");
    this.appendValueInput("DEPTH")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("depth");
    this.appendValueInput("HEIGHT")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("height");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Add a static object');
  }
};

Blockly.Blocks['cozmo_maze'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create maze");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Creates maze.');

    if (typeof MazeGenerator !== "undefined" && typeof Code !== "undefined") {
      var staticObjects = [];
      var maze = new MazeGenerator(100, 100, 5, 5);
      maze.drawLoop();
      maze.renderMaze(function(x1, y1, x2, y2) {
          staticObjects.push({
            x1: x1 - 50,
            y1: y1 - 50,
            x2: x2 - 50,
            y2: y2 - 50
          });
        }
      );
      this.data = JSON.stringify(staticObjects);
    }
  }
};

Blockly.Blocks['cozmo_play_animation'] = {
  init: function() {
    this.jsonInit({
      "message0": "Play %1 animation",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "ANIMATION",
          "options": [
            ["greeting", "GREETING"],
            ["sneeze", "SNEEZE"],
            ["what?", "WHAT"],
            ["win", "WIN"],
            ["lose", "LOSE"],
            ["facepalm", "FACEPALM"],
            ["beeping", "BEEPING"],
            ["new object", "NEW_OBJECT"],
            ["lost something", "LOST_SOMETHING"],
            ["reject", "REJECT"],
            ["failed", "FAILED"],
            ["excited greeting", "EXCITED_GREETING"],
            ["talky greeting", "TALKY_GREETING"]
          ]
        }
      ],
      "colour": Blockly.Blocks.cozmo.HUE2,
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};

Blockly.Blocks['cozmo_play_emotion'] = {
  init: function() {
    this.jsonInit({
      "message0": "Play %1 emotion",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "EMOTION",
          "options": [
            ["amazed", "AMAZED"],
            ["pleased", "PLEASED"],
            ["happy", "HAPPY"],
            ["upset", "UPSET"],
            ["angry", "ANGRY"],
            ["bored", "BORED"],
            ["startled", "STARTLED"]
          ]
        }
      ],
      "colour": Blockly.Blocks.cozmo.HUE2,
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};

Blockly.Blocks['cozmo_lift'] = {
  init: function() {
    this.appendValueInput("LIFT")
        .setCheck("Number")
        .appendField("lift height");
    this.appendDummyInput()
        .appendField("(0.0 to 1.0)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Set lift height. Range is 0.0 to 1.0');
  }
};

Blockly.Blocks['cozmo_head'] = {
  init: function() {
    this.appendValueInput("HEAD")
        .setCheck("Number")
        .appendField("head angle");
    this.appendDummyInput()
        .appendField("(-25.00° to 44.5°)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Set head angle. Range is -25.00° to 44.5°');
  }
};

Blockly.Blocks['cozmo_delay'] = {
  init: function() {
    this.appendValueInput("DELAY")
        .setCheck("Number")
        .appendField("delay for");
    this.appendDummyInput()
        .appendField("seconds");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Do nothing for the specified amount of time');
  }
};

Blockly.Blocks['cozmo_wait_for_tap'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Wait for cube tap");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Waits until cube is tapped. After that you can check for which cube was tapped.');
  }
};

Blockly.Blocks['cozmo_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Stop");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Stops all motors.');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#o4tb7h
Blockly.Blocks['cozmo_turn'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turn");
    this.appendValueInput("ANGLE")
        .setCheck("Number")
    this.appendDummyInput()
        .appendField("(degrees)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Turns by the given angle. Positive turns clockwise, negative - counter-clockwise');
    this.setColour(Blockly.Blocks.cozmo.HUE);
  }
};

Blockly.Blocks['cozmo_drive_distance_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Drive distance");
    this.appendValueInput("DISTANCE")
        .setCheck("Number")
    this.appendDummyInput()
        .appendField("(cm) with speed");
    this.appendValueInput("SPEED")
        .setCheck("Number")
    this.appendDummyInput()
        .appendField("(cm/s)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Drives given distance at given speed. Distance < 0 to drive backwards. Speed must be > 0');
    this.setColour(Blockly.Blocks.cozmo.HUE);
  }
};

Blockly.Blocks['cozmo_drive_wheels_speed'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Drive with speed: left wheel");
    this.appendValueInput("L_SPEED")
        .setCheck("Number")
    this.appendDummyInput()
        .appendField("(cm/s), right wheel");
    this.appendValueInput("R_SPEED")
        .setCheck("Number")
    this.appendDummyInput()
        .appendField("(cm/s)");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Drives continuously until explicitly stopped. Be very careful with this one.');
  }
};

Blockly.Blocks['cozmo_say'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck("String")
        .appendField("say");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Says text');
    this.setColour(Blockly.Blocks.cozmo.HUE);
  }
};

Blockly.Blocks['cozmo_goto_origin'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Go to origin");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Goes to where Cozmo was when program started.');
    this.setColour(Blockly.Blocks.cozmo.HUE);
  }
};

Blockly.Blocks['cozmo_drive_to'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Drive to X:");
    this.appendValueInput("X")
        .setCheck("Number")
    this.appendDummyInput()
        .appendField("Y:");
    this.appendValueInput("Y")
        .setCheck("Number")
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Drives to the specified coordinates if possible (e.g. no obstacles/static objects prevent from accomplishing the task.');
    this.setColour(Blockly.Blocks.cozmo.HUE);
  }
};

Blockly.Blocks['cozmo_cube_seen_number_boolean'] = {
  init: function() {
    this.jsonInit({
      "message0": "cube %1 been seen",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_visible_number_boolean'] = {
  init: function() {
    this.jsonInit({
      "message0": "cube %1 is visible",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_distance_to'] = {
  init: function() {
    this.jsonInit({
      "message0": "distance to cube %1 (cm)",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_distance_between'] = {
  init: function() {
    this.jsonInit({
      "message0": "distance between cubes %1 and %2 (cm)",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE1_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        },
        {
          "type": "field_dropdown",
          "name": "CUBE2_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_pickup'] = {
  init: function() {
    this.jsonInit({
      "message0": "Pickup cube %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_place_on_ground'] = {
  init: function() {
    this.jsonInit({
      "message0": "Place cube %1 on ground",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_place_on_cube'] = {
  init: function() {
    this.jsonInit({
      "message0": "Place current cube on cube %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_cube_turn_toward'] = {
  init: function() {
    this.jsonInit({
      "message0": "Turn to cube %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_on_cube_tapped'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("on cube tapped");
    this.appendStatementInput("BODY");
    this.setColour(Blockly.Blocks.cozmo.HUE2);
    this.setTooltip('Executes a block of code when a cube is tapped');
  }
};

Blockly.Blocks['cozmo_tapped_cube_number_boolean'] = {
  init: function() {
    this.jsonInit({
      "message0": "cube %1 tapped",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CUBE_NUM",
          "options": [
            [cubes["1"], "1"],
            [cubes["2"], "2"],
            [cubes["3"], "3"]
          ]
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.cozmo.HUE2,
    });
  }
};

Blockly.Blocks['cozmo_free_will'] = {
  init: function() {
    this.jsonInit({
      "message0": "%1 free will",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "FREE_WILL",
          "options": [
            ["Enable", "True"],
            ["Disable", "False"]
          ]
        }
      ],
      "colour": Blockly.Blocks.cozmo.HUE2,
      "previousStatement": null,
      "nextStatement": null,
    });
  }
};
