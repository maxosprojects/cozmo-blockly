/**
 * @fileoverview Generating JavaScript for Common blocks.
 * @author maxosprojects
 */
'use strict';

Blockly.JavaScript['math_angle'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  var order;
  if (code == Infinity) {
    code = 'float("inf")';
    order = Blockly.JavaScript.ORDER_FUNCTION_CALL;
  } else if (code == -Infinity) {
    code = '-float("inf")';
    order = Blockly.JavaScript.ORDER_UNARY_SIGN;
  } else {
    order = code < 0 ? Blockly.JavaScript.ORDER_UNARY_SIGN :
      Blockly.JavaScript.ORDER_ATOMIC;
  }
  return [code, order];
};

Blockly.JavaScript['cozmo_on_start'] = function(block) {
  var exitAtEnd = block.getFieldValue('EXIT_AT_END') === 'TRUE';
  var branch = Blockly.JavaScript.statementToCode(block, 'BODY');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id) || Blockly.JavaScript.PASS;
  var code = 'function on_start() {\n' + branch + '\n';
  // if (!exitAtEnd) {
  //   code += Blockly.JavaScript.INDENT 
  //         + 'while(true) {\n' 
  //         + Blockly.JavaScript.INDENT + Blockly.JavaScript.INDENT + 'time.sleep(1);\n'
  //         + Blockly.JavaScript.INDENT + '}\n';
  // }
  code += '}\n';
  return code;
};

////////////////////////////////////
// Utils
////////////////////////////////////

Blockly.JavaScript.getFloatOrVar = function(block, fieldName) {
  var value = parseFloat(Blockly.JavaScript.valueToCode(block, fieldName, Blockly.JavaScript.ORDER_NONE));
  if (isNaN(value)) {
    return Blockly.JavaScript.valueToCode(block, fieldName, Blockly.JavaScript.ORDER_NONE);
  } else {
    return value;
  }
}

Blockly.JavaScript.getIntOrVar = function(block, fieldName) {
  var value = parseInt(Blockly.JavaScript.valueToCode(block, fieldName, Blockly.JavaScript.ORDER_NONE));
  if (isNaN(value)) {
    return Blockly.JavaScript.valueToCode(block, fieldName, Blockly.JavaScript.ORDER_NONE);
  } else {
    return value;
  }
}

Blockly.JavaScript.hasParent = function(block, parentType) {
  if (block === null) {
    return false;
  } else {
    if (block.type === parentType) {
      return true;
    } else {
      return Blockly.JavaScript.hasParent(block.getParent(), parentType);
    }
  }
}
