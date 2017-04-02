/**
 * @fileoverview Generating Python for Aruco Marker blocks.
 * @author maxosprojects
 */
'use strict';

goog.provide('Blockly.Python.aruco');

goog.require('Blockly.Python');

Blockly.Python['aruco_adjust_angles'] = function(block) {
  var x = block.getFieldValue('X');
  var y = block.getFieldValue('Y');
  var z = block.getFieldValue('Z');
  var code = 'bot.adjustGroundAngles(' + x + ', ' + y + ', ' + z + ')\n';
  return code;
};

Blockly.Python['aruco_character'] = function(block) {
  var id = Blockly.Python.getIntOrVar(block, 'ID');
  var body = block.getInputTargetBlock('BODY');
  var elements = Blockly.Python.blockToCode(body);
  if (elements.length == 0) {
    return '';
  }
  var code = 'character = {"elements": []}\n';
  code += 'character["id"] = ' + id + '\n';
  code += elements + '\n';
  code += 'bot.addCharacter(character)\n';
  return code;
};

Blockly.Python['aruco_element'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_character')) {
    return '';
  }
  var size = Blockly.Python.valueToCode(block, 'SIZE', Blockly.Python.ORDER_NONE);
  var moveby = Blockly.Python.valueToCode(block, 'MOVE_BY', Blockly.Python.ORDER_NONE);
  var element = '{"size": ' + size + ', "moveby": ' + moveby + '}';
  var branch = Blockly.Python.statementToCode(block, 'BODY');
  branch = Blockly.Python.addLoopTrap(branch, block.id) || Blockly.Python.PASS;
  var code = 'element = ' + element + '\n';
  // This looks like not that bad hack compared to the one below (with regex)
  code += 'if True:\n';
  // // Unindent first line and then the rest
  // var re = new RegExp(Blockly.Python.INDENT);
  // branch = branch.replace(re, '');
  // re = new RegExp('\n' + Blockly.Python.INDENT, 'g');
  // branch = branch.replace(re, '\n');
  code += branch;
  code += 'character["elements"].append(element)\n';
  return code;
};

Blockly.Python['aruco_element_size'] = function(block) {
  var width = Blockly.Python.getFloatOrVar(block, 'WIDTH');
  var depth = Blockly.Python.getFloatOrVar(block, 'DEPTH');
  var height = Blockly.Python.getFloatOrVar(block, 'HEIGHT');
  var code = '{"width": ' + width + ', "depth": ' + depth + ', "height": ' + height + '}';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['aruco_element_move_by'] = function(block) {
  var x = Blockly.Python.getFloatOrVar(block, 'X');
  var y = Blockly.Python.getFloatOrVar(block, 'Y');
  var z = Blockly.Python.getFloatOrVar(block, 'Z');
  var code = '{"mx": ' + x + ', "my": ' + y + ', "mz": ' + z + '}';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['aruco_element_color'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_element')) {
    return '';
  }
  var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_NONE);
  var code = 'element["color"] = ' + color + '\n';
  return code;
};
