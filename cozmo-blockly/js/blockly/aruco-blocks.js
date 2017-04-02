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
Blockly.Blocks.aruco.HUE = 210;
Blockly.Blocks.aruco.HUE2 = 118;

var cubes = {
  "1": {"src": "img/thumbnails/cube1.png", "width": 13, "height": 11, "alt": "#1"},
  "2": {"src": "img/thumbnails/cube2.png", "width": 13, "height": 11, "alt": "#2"},
  "3": {"src": "img/thumbnails/cube3.png", "width": 13, "height": 11, "alt": "#3"}
};

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
    this.setColour(Blockly.Blocks.cozmo.HUE2);
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
        .appendField(new Blockly.FieldTextInput("character"), "ELEM_NAME");
    this.appendStatementInput("BODY");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.cozmo.HUE2);
    this.setTooltip('Builds a character');
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
        .appendField("move by");
    this.appendValueInput("COLOR")
        .setCheck("Colour")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("color")
        // .setVisible(false);
    this.appendStatementInput("BODY");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.cozmo.HUE2);
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
    this.setColour(Blockly.Blocks.cozmo.HUE);
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
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Moves element in any direction from the Origin (marker)');
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
    this.setColour(Blockly.Blocks.cozmo.HUE);
    this.setTooltip('Sets color of the element');
  }
};
