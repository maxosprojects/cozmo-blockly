
//////// Override to enable variables in a "scope" ///////
/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.JavaScript.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.JavaScript.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.JavaScript.functionNames_ = Object.create(null);

  if (!Blockly.JavaScript.variableDB_) {
    Blockly.JavaScript.variableDB_ =
        new Blockly.Names(Blockly.JavaScript.RESERVED_WORDS_);
  } else {
    Blockly.JavaScript.variableDB_.reset();
  }

  var defvars = [];
  var variables = workspace.variableList;
  if (variables.length) {
    for (var i = 0; i < variables.length; i++) {
      defvars[i] = Blockly.JavaScript.variableDB_.getName(variables[i],
          Blockly.Variables.NAME_TYPE);
    }
    // Blockly.JavaScript.definitions_['variables'] =
    //     'var ' + defvars.join(', ') + ';';
    Blockly.JavaScript.definitions_['variables'] =
        'var scope = {};';
  }
};

Blockly.JavaScript['variables_get'] = function(block) {
  // Variable getter.
  var code = 'scope.' + Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var varName = 'scope.' + Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + argument0 + ';\n';
};

///// End override ///////

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
      return Blockly.JavaScript.hasParent(block.getSurroundParent(), parentType);
    }
  }
}
