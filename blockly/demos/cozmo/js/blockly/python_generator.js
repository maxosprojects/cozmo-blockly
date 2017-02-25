/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Python for cozmo blocks.
 * @author maxosprojects
 */
'use strict';

goog.provide('Blockly.Python.cozmo');

goog.require('Blockly.Python');

Blockly.Python['cozmo_on_start'] = function(block) {
	// First, add a 'global' statement for every variable that is not shadowed by
	// a local parameter.
	var globals = [];
	for (var i = 0, varName; varName = block.workspace.variableList[i]; i++) {
		globals.push(Blockly.Python.variableDB_.getName(varName,
			Blockly.Variables.NAME_TYPE));
	}
	globals = globals.length ? '  global ' + globals.join(', ') + '\n' : '';
	var branch = Blockly.Python.statementToCode(block, 'BODY');
	branch = Blockly.Python.addLoopTrap(branch, block.id) ||
			Blockly.Python.PASS;
	var code = 'def on_start():\n' + globals + branch + '\n';
	return code;
};

Blockly.Python['cozmo_set_cube_model'] = function(block) {
	var model = block.getFieldValue('MODEL');
  	var num = block.getFieldValue('CUBE_NUM');
	if (typeof Code !== "undefined") {
		Code.setCubeModel(model, num);
	}
	return '';
};

Blockly.Python['cozmo_play_animation'] = function(block) {
	var animation = block.getFieldValue('ANIMATION');
	var code = 'bot.playAnimation("' + animation + '")\n';
	return code;
};

Blockly.Python['cozmo_play_emotion'] = function(block) {
	var emotion = block.getFieldValue('EMOTION');
	var code = 'bot.playEmotion("' + emotion + '")\n';
	return code;
};

Blockly.Python['cozmo_lift'] = function(block) {
	var lift = Blockly.Python.valueToCode(block, 'LIFT', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.lift(' + lift + ')\n';
	return code;
};

Blockly.Python['cozmo_head'] = function(block) {
	var head = Blockly.Python.valueToCode(block, 'HEAD', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.head(' + head + ')\n';
	return code;
};

Blockly.Python['cozmo_delay'] = function(block) {
	var delay = Blockly.Python.valueToCode(block, 'DELAY', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.delay(' + delay + ')\n';
	return code;
};

Blockly.Python['cozmo_stop'] = function(block) {
	var code = 'bot.stop()\n';
	return code;
};

Blockly.Python['cozmo_wait_for_tap'] = function(block) {
	var code = 'tapped_cube = bot.waitForTap()\n';
	return code;
};

Blockly.Python['cozmo_turn'] = function(block) {
	var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.turn(' + angle + ')\n';
	return code;
};

Blockly.Python['cozmo_goto_origin'] = function(block) {
	var code = 'bot.gotoOrigin()\n';
	return code;
};

Blockly.Python['cozmo_drive_distance_speed'] = function(block) {
	var distance = Blockly.Python.valueToCode(block, 'DISTANCE', Blockly.Python.ORDER_ATOMIC);
	var speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.driveDistanceWithSpeed(' + distance + ', ' + speed + ')\n';
	return code;
};

Blockly.Python['cozmo_drive_wheels_speed'] = function(block) {
	var lSpeed = Blockly.Python.valueToCode(block, 'L_SPEED', Blockly.Python.ORDER_ATOMIC);
	var rSpeed = Blockly.Python.valueToCode(block, 'R_SPEED', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.driveWheelsWithSpeed(' + lSpeed + ', ' + rSpeed + ')\n';
	return code;
};

Blockly.Python['cozmo_cube_seen_number_boolean'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.getCubeSeen(cozmo.objects.LightCube" + num + "Id)";
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['cozmo_cube_visible_number_boolean'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.getCubeIsVisible(cozmo.objects.LightCube" + num + "Id)";
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['cozmo_cube_distance_to'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.getCubeDistance(cozmo.objects.LightCube" + num + "Id)";
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['cozmo_cube_pickup'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.pickupCube(cozmo.objects.LightCube" + num + "Id)\n";
  return code;
};

Blockly.Python['cozmo_cube_place_on_ground'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.placeCubeOnGround(cozmo.objects.LightCube" + num + "Id)\n";
  return code;
};

Blockly.Python['cozmo_cube_place_on_cube'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.placeCubeOnCube(cozmo.objects.LightCube" + num + "Id)\n";
  return code;
};

Blockly.Python['cozmo_cube_turn_toward'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "bot.turnTowardCube(cozmo.objects.LightCube" + num + "Id)\n";
  return code;
};

Blockly.Python['cozmo_on_cube_tapped'] = function(block) {
	// First, add a 'global' statement for every variable that is not shadowed by
	// a local parameter.
	var globals = [];
	for (var i = 0, varName; varName = block.workspace.variableList[i]; i++) {
		globals.push(Blockly.Python.variableDB_.getName(varName,
			Blockly.Variables.NAME_TYPE));
	}
	globals = globals.length ? '  global ' + globals.join(', ') + '\n' : '';
	var branch = Blockly.Python.statementToCode(block, 'BODY');
	branch = Blockly.Python.addLoopTrap(branch, block.id) ||
			Blockly.Python.PASS;
	var code = 'def on_cube_tapped(evt, *, obj, tap_count, tap_duration, tap_intensity, **kwargs):\n'
				+ globals
				+ Blockly.Python.INDENT + 'tapped_cube = obj\n'
				+ branch;
	return code;
};

Blockly.Python['cozmo_tapped_cube_number_boolean'] = function(block) {
  var num = block.getFieldValue('CUBE_NUM');
  var code = "(cozmo.objects.LightCube" + num + "Id == bot.getCubeNumber(tapped_cube))";
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['cozmo_say'] = function(block) {
	var text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_ATOMIC);
	var code = 'bot.say(' + text + ')\n';
	return code;
};

Blockly.Python['cozmo_free_will'] = function(block) {
	var enable = block.getFieldValue('FREE_WILL');
	var code = 'bot.enableFreeWill(' + enable + ')\n';
	return code;
};
