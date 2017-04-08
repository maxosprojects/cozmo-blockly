/**
 * @fileoverview Aruco Marker blocks for Blockly.
 * @author maxosprojects
 */
'use strict';

goog.provide('Blockly.Blocks.aruco');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.aruco.markerHUE = 20;
Blockly.Blocks.aruco.elementHUE = 180;
Blockly.Blocks.aruco.paramsHUE = 100;
Blockly.Blocks.aruco.elementPartsHUE = 120;

Blockly.Blocks['aruco_adjust_angles'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("adjust ground angles, x:");
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), "X");
    this.appendDummyInput()
        .appendField(" y:");
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), "Y");
    this.appendDummyInput()
        .appendField(" z:");
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(0), "Z");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip("Adjusts ground angles to account for camera lens imperfections");
  }
};

Blockly.Blocks['aruco_character'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("marker");
    this.appendValueInput("ID")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT);
    this.appendDummyInput()
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("character"), "CHAR_NAME");
    this.appendStatementInput("BODY");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Builds a character');
  }
};

Blockly.Blocks['aruco_character_static'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("static");
    this.appendValueInput("CHAR_NAME")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT);
    this.appendStatementInput("BODY");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Builds a static character');
  }
};

Blockly.Blocks['aruco_character_texture'] = {
  init: function() {
    this.appendValueInput("TEXTURE")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("set character texture");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField(".png");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Set texture to use for the character');
  }
};

Blockly.Blocks['aruco_character_move_by'] = {
  init: function() {
    this.appendValueInput("MOVE_BY")
        .setCheck("Aruco_Move_By")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("translate character");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Translates character in any direction from the origin (marker). Applied after character rotation, if any');
  }
};

Blockly.Blocks['aruco_character_scale'] = {
  init: function() {
    this.appendValueInput("SCALE")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("character scale");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("%");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Scales character. Origin remains the same relative to the updated character (i.e. if it was the bottom, it remains the bottom');
  }
};

Blockly.Blocks['aruco_rotate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("rotate");
    this.appendValueInput("PIVOT")
        .setCheck("Aruco_Move_By")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("pivot");
    this.appendValueInput("ANGLES")
        .setCheck("Aruco_Angles")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("angles");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Rotates character or element. Applied before translation, if any. Pivot point defines new Origin (for character that means the marker location)');
  }
};

Blockly.Blocks['aruco_animate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("animation")
        .appendField(new Blockly.FieldTextInput("name"), "ANIM_NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'LOCAL')
        .appendField('local');
    this.appendDummyInput()
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'AND_BACK')
        .appendField('forth and back');
    this.appendDummyInput()
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'LOOP')
        .appendField('loop');
    this.appendValueInput("PIVOT")
        .setCheck("Aruco_Move_By")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("pivot");
    this.appendValueInput("ANGLES_START")
        .setCheck("Aruco_Angles")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("start angles");
    this.appendValueInput("ANGLES_STOP")
        .setCheck("Aruco_Angles")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("stop angles");
    this.appendValueInput("DURATION")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("duration");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip('Executes animation: rotating element or character around pivot point from "start angles" to "stop angles" for specifid duration');
  }
};

Blockly.Blocks['aruco_element'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("element"), "ELEM_NAME");
    this.appendValueInput("SIZE")
        .setCheck("Aruco_Size")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("size");
    this.appendValueInput("MOVE_BY")
        .setCheck("Aruco_Move_By")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("translate");
    this.appendValueInput("COLOR")
        .setCheck("Colour")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("color")
        // .setVisible(false);
    this.appendStatementInput("BODY");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.aruco.elementHUE);
    this.setTooltip('Builds an element of the character');
  }
};

Blockly.Blocks['aruco_element_size'] = {
  init: function() {
    this.appendValueInput("WIDTH")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("width");
    this.appendValueInput("DEPTH")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("depth");
    this.appendValueInput("HEIGHT")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("height");
    this.setOutput(true, "Aruco_Size");
    this.setMovable(false);
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.paramsHUE);
    this.setTooltip('Sets size of the element');
  }
};

Blockly.Blocks['aruco_element_move_by'] = {
  init: function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("x");
    this.appendValueInput("Y")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y");
    this.appendValueInput("Z")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("z");
    this.setOutput(true, "Aruco_Move_By");
    this.setMovable(false);
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.paramsHUE);
    this.setTooltip('Translates element in any direction from the Origin');
  }
};

Blockly.Blocks['aruco_angles'] = {
  init: function() {
    this.appendValueInput("X")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("x");
    this.appendValueInput("Y")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y");
    this.appendValueInput("Z")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("z");
    this.setOutput(true, "Aruco_Angles");
    this.setMovable(false);
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.paramsHUE);
    this.setTooltip('Rotations');
  }
};

Blockly.Blocks['aruco_element_color'] = {
  init: function() {
    this.appendValueInput("COLOR")
        .setCheck("Colour")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("element color");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.aruco.elementPartsHUE);
    this.setTooltip('Sets color of the element');
  }
};

Blockly.Blocks['aruco_element_texture'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("set element texture");
    this.appendValueInput("RIGHT")
        .setCheck("Aruco_Texture_Params")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("right");
    this.appendValueInput("FRONT")
        .setCheck("Aruco_Texture_Params")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("front");
    this.appendValueInput("LEFT")
        .setCheck("Aruco_Texture_Params")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("left");
    this.appendValueInput("BACK")
        .setCheck("Aruco_Texture_Params")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("back");
    this.appendValueInput("TOP")
        .setCheck("Aruco_Texture_Params")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("top");
    this.appendValueInput("BOTTOM")
        .setCheck("Aruco_Texture_Params")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("bottom");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.aruco.elementPartsHUE);
    this.setTooltip("Sets up element texture chunk from character's main texture");
  }
};

Blockly.Blocks['aruco_element_texture_params'] = {
  init: function() {
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
    this.appendDummyInput()
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'MIRRORED')
        .appendField('mirrored');
    this.setOutput(true, "Aruco_Texture_Params");
    // this.setMovable(false);
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.paramsHUE);
    this.setTooltip("Element texture top-left and bottom-right corners' coordinates");
  }
};

Blockly.Blocks['aruco_conditional'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField('on condition');
    this.appendStatementInput("BODY");
    this.setColour(Blockly.Blocks.cozmo.HUE2);
    this.setTooltip('Executes piece of program on condition');
  }
};

Blockly.Blocks['aruco_distance'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('distance');
    this.appendValueInput("FROM")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("from marker");
    this.appendValueInput("TO")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("to marker");
    this.setOutput(true, "Number");
    this.setInputsInline(true);
    this.setColour(Blockly.Blocks.aruco.paramsHUE);
    this.setTooltip("Distance between markers, cm");
  }
};

Blockly.Blocks['aruco_animation_start'] = {
  init: function() {
    this.appendValueInput("ANIM_NAME")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("start");
    this.appendValueInput("CHARACTER")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("animation on character");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip("Start animation with given name on given character");
  }
};

Blockly.Blocks['aruco_animation_stop'] = {
  init: function() {
    this.appendValueInput("ANIM_NAME")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("stop");
    this.appendValueInput("CHARACTER")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("animation on character");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.aruco.markerHUE);
    this.setTooltip("Stop animation with given name on given character");
  }
};
