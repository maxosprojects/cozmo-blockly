/**
 * @fileoverview Generating Python for Common blocks.
 * @author maxosprojects
 */
'use strict';

Blockly.Python['math_angle'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  var order;
  if (code == Infinity) {
    code = 'float("inf")';
    order = Blockly.Python.ORDER_FUNCTION_CALL;
  } else if (code == -Infinity) {
    code = '-float("inf")';
    order = Blockly.Python.ORDER_UNARY_SIGN;
  } else {
    order = code < 0 ? Blockly.Python.ORDER_UNARY_SIGN :
      Blockly.Python.ORDER_ATOMIC;
  }
  return [code, order];
};

////////////////////////////////////
// Utils
////////////////////////////////////

function getFloatOrVar(block, fieldName) {
  var value = parseFloat(Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE));
  if (isNaN(value)) {
    return Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE);
  } else {
    return value;
  }
}

function getIntOrVar(block, fieldName) {
  var value = parseInt(Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE));
  if (isNaN(value)) {
    return Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE);
  } else {
    return value;
  }
}

function hasParent(block, parentType) {
  if (block === null) {
    return false;
  } else {
    if (block.type === parentType) {
      return true;
    } else {
      return hasParent(block.getParent(), parentType);
    }
  }
}
