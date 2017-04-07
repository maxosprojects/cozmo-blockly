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

Blockly.Python['cozmo_on_start'] = function(block) {
  // First, add a 'global' statement for every variable that is not shadowed by
  // a local parameter.
  var globals = [];
  for (var i = 0, varName; varName = block.workspace.variableList[i]; i++) {
    globals.push(Blockly.Python.variableDB_.getName(varName,
      Blockly.Variables.NAME_TYPE));
  }
  globals = globals.length ? '  global ' + globals.join(', ') + '\n' : '';
  var exitAtEnd = block.getFieldValue('EXIT_AT_END') === 'TRUE';
  var branch = Blockly.Python.statementToCode(block, 'BODY');
  branch = Blockly.Python.addLoopTrap(branch, block.id) || Blockly.Python.PASS;
  var code = 'def on_start():\n' + globals + branch + '\n';
  if (!exitAtEnd) {
    code += Blockly.Python.INDENT + 'while True:\n' + Blockly.Python.INDENT + Blockly.Python.INDENT + 'time.sleep(1)'
  }
  return code;
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
