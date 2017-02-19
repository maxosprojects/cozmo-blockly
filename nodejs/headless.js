// This program is to be used with NodeJS to translate Cozmo Blockly XML AST to Python code.

global.DOMParser = require('xmldom').DOMParser;
global.document = new DOMParser().parseFromString('<xml/>');;

require('../closure-library/closure/goog/bootstrap/nodejs');
global.Blockly = require('../blockly/blockly_uncompressed.js');

// require('../blockly/blocks_compressed.js');
// require('../blockly/python_compressed.js');

require('../blockly/blocks/cozmo.js');
require('../blockly/blocks/logic.js');
require('../blockly/blocks/loops.js');
require('../blockly/blocks/math.js');
require('../blockly/blocks/text.js');
require('../blockly/blocks/lists.js');
require('../blockly/blocks/colour.js');
require('../blockly/blocks/variables.js');
require('../blockly/blocks/procedures.js');
require('../blockly/generators/python.js');
require('../blockly/generators/python/cozmo.js');
require('../blockly/generators/python/logic.js');
require('../blockly/generators/python/loops.js');
require('../blockly/generators/python/math.js');
require('../blockly/generators/python/text.js');
require('../blockly/generators/python/lists.js');
require('../blockly/generators/python/colour.js');
require('../blockly/generators/python/variables.js');
require('../blockly/generators/python/procedures.js');

require('../blockly/msg/messages.js');

Blockly.Python.STATEMENT_PREFIX = 'highlighter.send(%1)\n';

var express = require('express');
var bodyParser = require('body-parser')

var app = express();

app.use(bodyParser.text());

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.post('/translate', function (req, res) {
  res.status(200).send(translate(req.body));
});

var server = app.listen(9091, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Cozmo Blockly XML AST -> Python translator service started at http://%s:%s', host, port);
});

var translate = function(data) {
  var xml = Blockly.Xml.textToDom(data);
  // Create a headless workspace.
  var workspace = new Blockly.Workspace();
  Blockly.Xml.domToWorkspace(xml, workspace);
  var code = Blockly.Python.workspaceToCode(workspace);
  return code;
}
