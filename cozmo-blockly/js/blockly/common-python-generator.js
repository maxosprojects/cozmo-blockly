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

Blockly.Python.getFloatOrVar = function(block, fieldName) {
  var value = parseFloat(Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE));
  if (isNaN(value)) {
    return Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE);
  } else {
    return value;
  }
}

Blockly.Python.getIntOrVar = function(block, fieldName) {
  var value = parseInt(Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE));
  if (isNaN(value)) {
    return Blockly.Python.valueToCode(block, fieldName, Blockly.Python.ORDER_NONE);
  } else {
    return value;
  }
}

Blockly.Python.hasParent = function(block, parentType) {
  if (block === null) {
    return false;
  } else {
    if (block.type === parentType) {
      return true;
    } else {
      return Blockly.Python.hasParent(block.getParent(), parentType);
    }
  }
}
