/**
 * @fileoverview Common blocks for Blockly.
 * @author maxosprojects
 */
'use strict';

// A hack to prevent rendering degree symbol as it is flaky.
// This is done to make it easy to upgrade blockly (keep it intact).
Blockly.FieldAngle.prototype.setText = function(text) {
  Blockly.FieldAngle.superClass_.setText.call(this, text);
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  this.updateGraph_();
  // // Insert degree symbol.
  // if (this.sourceBlock_.RTL) {
  //   this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild);
  // } else {
  //   this.textElement_.appendChild(this.symbol_);
  // }
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

Blockly.Blocks['math_angle'] = {
  /**
   * Block for numeric angle value.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldAngle('0'), 'NUM');
    this.appendDummyInput()
        .appendField("°");
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setTooltip('An angle.');
  }
};
