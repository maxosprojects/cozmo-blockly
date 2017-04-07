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

Blockly.Python['aruco_character_texture'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_character')) {
    return '';
  }
  var texture = Blockly.Python.valueToCode(block, 'TEXTURE', Blockly.Python.ORDER_NONE);
  var code = 'character["texture"] = ' + texture + '\n';
  return code;
};

Blockly.Python['aruco_character_move_by'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_character')) {
    return '';
  }
  var moveby = Blockly.Python.valueToCode(block, 'MOVE_BY', Blockly.Python.ORDER_NONE);
  var code = 'character["moveby"] = ' + moveby + '\n';
  return code;
};

Blockly.Python['aruco_character_scale'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_character')) {
    return '';
  }
  var scale = Blockly.Python.valueToCode(block, 'SCALE', Blockly.Python.ORDER_NONE);
  var code = 'character["scale"] = ' + scale + '\n';
  return code;
};

Blockly.Python['aruco_rotate'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_character')) {
    return '';
  }
  var pivot = Blockly.Python.valueToCode(block, 'PIVOT', Blockly.Python.ORDER_NONE);
  var angles = Blockly.Python.valueToCode(block, 'ANGLES', Blockly.Python.ORDER_NONE);
  var rotate = '{"pivot": ' + pivot + ', "angles": ' + angles + '}';
  var code;
  if (Blockly.Python.hasParent(block, 'aruco_element')) {
    code = 'element["rotate"] = ' + rotate + '\n';
  } else {
    code = 'character["rotate"] = ' + rotate + '\n';
  }
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
  // This looks like not as bad hack as the one below (with regex)
  code += 'if True:\n';
  // // Unindent first line and then the rest
  // var re = new RegExp(Blockly.Python.INDENT);
  // branch = branch.replace(re, '');
  // re = new RegExp('\n' + Blockly.Python.INDENT, 'g');
  // branch = branch.replace(re, '\n');
  code += branch;
  code += 'if "color" in element or ("texture" in element and "texture" in character):\n'
  code += Blockly.Python.INDENT + 'character["elements"].append(element)\n';
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

Blockly.Python['aruco_element_texture'] = function(block) {
  if (!Blockly.Python.hasParent(block, 'aruco_element')) {
    return '';
  }
  var left = Blockly.Python.valueToCode(block, 'LEFT', Blockly.Python.ORDER_NONE);
  var front = Blockly.Python.valueToCode(block, 'FRONT', Blockly.Python.ORDER_NONE);
  var right = Blockly.Python.valueToCode(block, 'RIGHT', Blockly.Python.ORDER_NONE);
  var back = Blockly.Python.valueToCode(block, 'BACK', Blockly.Python.ORDER_NONE);
  var top = Blockly.Python.valueToCode(block, 'TOP', Blockly.Python.ORDER_NONE);
  var bottom = Blockly.Python.valueToCode(block, 'BOTTOM', Blockly.Python.ORDER_NONE);
  var params = '{"left": ' + left + ', "front": ' + front + ', "right": ' + right + ', "back": ' + back + ', "top": ' + top + ', "bottom": ' + bottom + '}';
  var code = 'element["texture"] = ' + params + '\n';
  return code;
};

Blockly.Python['aruco_element_texture_params'] = function(block) {
  var x1 = Blockly.Python.getIntOrVar(block, 'X1');
  var y1 = Blockly.Python.getIntOrVar(block, 'Y1');
  var x2 = Blockly.Python.getIntOrVar(block, 'X2');
  var y2 = Blockly.Python.getIntOrVar(block, 'Y2');
  var mirrored = block.getFieldValue('MIRRORED') === 'TRUE' ? 'True' : 'False';
  var code = '{"x1": ' + x1 + ', "y1": ' + y1 + ', "x2": ' + x2 + ', "y2": ' + y2 + ', "mirrored": ' + mirrored + '}';
  return [code, Blockly.Python.ORDER_NONE];
};
