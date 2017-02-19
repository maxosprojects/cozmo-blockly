/**
 * Blockly Demos: Cozmo
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
 * @fileoverview JavaScript for Blockly's Cozmo demo.
 * @author maxosprojects
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
  'en': 'English'
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = ['ar', 'fa', 'he', 'lki'];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

Code.camera = null;
Code.highlighter = null;

/**
 * Angle increases clockwise (true) or counterclockwise (false).
 */
Blockly.FieldAngle.CLOCKWISE = false;

/**
 * Offset the location of 0 degrees (and all angles) by a constant.
 * Usually either 0 (0 = right) or 90 (0 = up).
 */
Blockly.FieldAngle.OFFSET = 0;

/**
 * Maximum allowed angle before wrapping.
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 */
Blockly.FieldAngle.WRAP = 360;

Blockly.Python.STATEMENT_PREFIX = 'highlighter.send(%1)\n';
Blockly.Python.addReservedWords('highlighter', 'cozmo, robot, bot, tapped_cube');

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function() {
  var lang = Code.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'en';
  }
  return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key trigers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  } else if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if ('BlocklyStorage' in window) {
    // Restore saved blocks in a separate thread so that subsequent
    // initialization is not affected from a failed load.
    window.setTimeout(BlocklyStorage.restoreBlocks, 0);
  }
};

/**
 * Save the blocks and reload with a different language.
 */
Code.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  // This should be skipped for the index page, which has no blocks and does
  // not load Blockly.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (typeof Blockly != 'undefined' && window.sessionStorage) {
    var xml = Blockly.Xml.workspaceToDom(Code.workspace);
    var text = Blockly.Xml.domToText(xml);
    window.sessionStorage.loadOnceBlocks = text;
  }

  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function() {
  //<link rel="stylesheet" href="../prettify.css">
  //<script src="../prettify.js"></script>
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', '../prettify.css');
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.setAttribute('src', '../prettify.js');
  document.head.appendChild(script);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
Code.getBBox_ = function(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

/**
 * List of tab names.
 * @private
 */
// Code.TABS_ = ['blocks', 'javascript', 'php', 'python', 'dart', 'lua', 'xml'];
Code.TABS_ = ['blocks', 'camera', 'python', 'xml'];

Code.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName) {
  // If the XML tab was open, save and render the content.
  if (document.getElementById('tab_xml').className == 'tabon') {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlText = xmlTextarea.value;
    var xmlDom = null;
    try {
      xmlDom = Blockly.Xml.textToDom(xmlText);
    } catch (e) {
      var q =
          window.confirm(MSG['badXml'].replace('%1', e));
      if (!q) {
        // Leave the user on the XML tab.
        return;
      }
    }
    if (xmlDom) {
      Code.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
    }
  }

  Code.stopCamera();
  Code.stopHighlighter();

  // If blocks tab was open, hide workspace.
  if (document.getElementById('tab_blocks').className == 'tabon') {
    Code.workspace.setVisible(false);
  }
  // Deselect all tabs and hide all panes.
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    document.getElementById('tab_' + name).className = 'taboff';
    document.getElementById('content_' + name).style.visibility = 'hidden';
  }

  // Select the active tab.
  Code.selected = clickedName;
  document.getElementById('tab_' + clickedName).className = 'tabon';
  // Show the selected pane.
  document.getElementById('content_' + clickedName).style.visibility =
      'visible';
  Code.renderContent();
  Blockly.svgResize(Code.workspace);
};

Code.drawImageBinary = function(data, canvas, context) {
  var blob  = new Blob([data],{type: "image/jpeg"});
  var img = new Image();
  img.onload = function (e) {
    context.drawImage(img, 0, 0);
    window.URL.revokeObjectURL(img.src);    
    img = null;  
  };
  img.onerror = img.onabort = function () {         
    img = null;
  };
  img.src = window.URL.createObjectURL(blob); 
}

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
  var content = document.getElementById('content_' + Code.selected);
  var renderInnerContent = function(code, type) {
    content.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = content.textContent;
      code = prettyPrintOne(code, type);
      content.innerHTML = code;
    }
  };
  // Initialize the pane.
  if (Code.selected == 'xml') {
    var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    content.value = xmlText;
    content.focus();
  } else if (Code.selected == 'blocks') {
    Code.workspace.setVisible(true);
    Code.startHighlighter();
  } else if (Code.selected == 'camera') {
    Code.startCamera();
  } else if (Code.selected == 'javascript') {
    var code = Blockly.JavaScript.workspaceToCode(Code.workspace);
    renderInnerContent(code, 'js');
  } else if (Code.selected == 'python') {
    var code = Blockly.Python.workspaceToCode(Code.workspace);
    renderInnerContent(code, 'py');
  } else if (Code.selected == 'php') {
    var code = Blockly.PHP.workspaceToCode(Code.workspace);
    renderInnerContent(code, 'php');
  } else if (Code.selected == 'dart') {
    var code = Blockly.Dart.workspaceToCode(Code.workspace);
    renderInnerContent(code, 'dart');
  } else if (Code.selected == 'lua') {
    var code = Blockly.Lua.workspaceToCode(Code.workspace);
    renderInnerContent(code, 'lua');
  }
};

Code.initDialog = function() {
  var filesElem = $('#files'),
    filenameElem = $('#filename');

  Code.dialog = $('#dialog-form').dialog({
    autoOpen: false,
    height: 400,
    width: 550,
    modal: true,
    buttons: [
      {
        text: 'Open',
        autofocus: '',
        click: function() {
          var filenameElem = $('#filename'),
            filename = filenameElem.val();

          if (Code.discard()) {
            Code.loadXmlFromUrl('/saves/' + filename);
            Code.dialog.dialog( "close" );
          }
        }
      },
      {
        text: 'Save',
        click: function() {
          var filenameElem = $('#filename'),
            filename = filenameElem.val();

          if ($.inArray(filename, Code.files) === -1) {
            Code.sendXmlToUrl('/saves/' + filename);
            Code.dialog.dialog( "close" );
          } else {
            if (confirm('Are you sure you want to overwrite "' + filename + '"?')) {
              Code.sendXmlToUrl('/saves/' + filename);
              Code.dialog.dialog( "close" );
            }
          }
        }
      },
      {
        text: 'Cancel',
        click: function() {
          Code.dialog.dialog( "close" );
        }
      }
    ],
    open: function() {
      Code.getFiles();
    },
    close: function() {
      // form[0].reset();
    }
  });

  $( "#files" ).selectable({
    stop: function() {
      var result = $( "#select-result" ).empty();
      $('.ui-selected', this).each(function() {
        filenameElem.val($(this).text());
      });
    }
  });
};


Code.handleMouseDown = function(e) {
  e.preventDefault();
  Code.startX = parseInt(e.clientX);
  Code.startY = parseInt(e.clientY);

  // Put your mousedown stuff here
  Code.isMouseDown = true;
}

Code.handleMouseUp = function(e) {
  e.preventDefault();
  // mouseX = parseInt(e.clientX - offsetX);
  // mouseY = parseInt(e.clientY - offsetY);

  // Put your mouseup stuff here
  Code.isMouseDown = false;
}

Code.handleMouseOut = function(e) {
  e.preventDefault();
  // mouseX = parseInt(e.clientX - offsetX);
  // mouseY = parseInt(e.clientY - offsetY);

  // Put your mouseOut stuff here
  Code.isMouseDown = false;
}

Code.handleMouseMove = function(e) {
  var x, y;

  if (!Code.isMouseDown) {
    return;
  }
  e.preventDefault();

  if (e.originalEvent && e.originalEvent.changedTouches) {
    console.log('changed touches set');
    x = e.originalEvent.changedTouches[0].pageX;
    y = e.originalEvent.changedTouches[0].pageY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }

  var data = {
    x: parseInt(x - Code.startX),
    y: parseInt(y - Code.startY)
  };

  Code.startX = x;
  Code.startY = y;

  $.ajax({
    url: '.pantilt',
    method: 'POST',
    data: JSON.stringify(data)
  })
  .done(function(data, textStatus, jqXHR) {
    console.log('success');
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
  });
}

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  Code.initDialog();
  Code.initLanguage();

  var rtl = Code.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
    var bBox = Code.getBBox_(container);
    for (var i = 0; i < Code.TABS_.length; i++) {
      var el = document.getElementById('content_' + Code.TABS_[i]);
      el.style.top = bBox.y + 'px';
      el.style.left = bBox.x + 'px';
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + 'px';
      el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
      el.style.width = bBox.width + 'px';
      el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
    }
    // Make the 'Blocks' tab line up with the toolbox.
    if (Code.workspace && Code.workspace.toolbox_.width) {
      document.getElementById('tab_blocks').style.minWidth =
          (Code.workspace.toolbox_.width - 38) + 'px';
          // Account for the 19 pixel margin and on each side.
    }
  };
  window.addEventListener('resize', onresize, false);

  // Interpolate translated messages into toolbox.
  var toolboxText = document.getElementById('toolbox').outerHTML;
  toolboxText = toolboxText.replace(/{(\w+)}/g,
      function(m, p1) {return MSG[p1]});
  var toolboxXml = Blockly.Xml.textToDom(toolboxText);

  Code.workspace = Blockly.inject('content_blocks',
      {grid:
          {spacing: 25,
           length: 3,
           colour: '#ccc',
           snap: true},
       media: '../../media/',
       rtl: rtl,
       toolbox: toolboxXml,
       zoom:
           {controls: true,
            wheel: true}
      });

  // Add to reserved word list: Local variables in execution environment (runJS)
  // and the infinite loop detection function.
  // Blockly.JavaScript.addReservedWords('code,timeouts,checkTimeout');

  Code.loadBlocks('');

  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    BlocklyStorage.backupOnUnload(Code.workspace);
  }

  Code.tabClick(Code.selected);

  Code.bindClick('trashButton',
      function() {Code.discard(); Code.renderContent();});
  // Code.bindClick('runButton', Code.runJS);
  Code.bindClick('runButton', Code.runRemotely);
  Code.bindClick('stopButton', Code.stopRemoteExecution);
  Code.bindClick('saveButton', Code.onFileSaveOpen);
  // Disable the link button if page isn't backed by App Engine storage.
  var linkButton = document.getElementById('linkButton');
  if ('BlocklyStorage' in window) {
    BlocklyStorage['HTTPREQUEST_ERROR'] = MSG['httpRequestError'];
    BlocklyStorage['LINK_ALERT'] = MSG['linkAlert'];
    BlocklyStorage['HASH_ERROR'] = MSG['hashError'];
    BlocklyStorage['XML_ERROR'] = MSG['xmlError'];
    Code.bindClick(linkButton,
        function() {BlocklyStorage.link(Code.workspace);});
  } else if (linkButton) {
    linkButton.className = 'disabled';
  }

  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    Code.bindClick('tab_' + name, function(name_) {
        return function() {
          Code.tabClick(name_);
        };
      }(name));
  }
  onresize();
  Blockly.svgResize(Code.workspace);

  // Lazy-load the syntax-highlighting.
  window.setTimeout(Code.importPrettify, 1);
};

/**
 * Initialize the page language.
 */
Code.initLanguage = function() {
  // Set the HTML's language and direction.
  var rtl = Code.isRtl();
  document.dir = rtl ? 'rtl' : 'ltr';
  document.head.parentElement.setAttribute('lang', Code.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in Code.LANGUAGE_NAME) {
    languages.push([Code.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == Code.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  languageMenu.addEventListener('change', Code.changeLanguage, true);

  // Inject language strings.
  // document.title += ' ' + MSG['title'];
  // document.getElementById('title').textContent = MSG['title'];
  document.getElementById('tab_blocks').textContent = MSG['blocks'];

  document.getElementById('linkButton').title = MSG['linkTooltip'];
  document.getElementById('runButton').title = MSG['runTooltip'];
  document.getElementById('trashButton').title = MSG['trashTooltip'];
};

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 */
Code.runJS = function() {
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '  checkTimeout();\n';
  var timeouts = 0;
  var checkTimeout = function() {
    if (timeouts++ > 1000000) {
      throw MSG['timeout'];
    }
  };
  var code = Blockly.JavaScript.workspaceToCode(Code.workspace);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
  try {
    eval(code);
  } catch (e) {
    alert(MSG['badCode'].replace('%1', e));
  }
};

Code.sendCodeToUrl = function(urlToSendTo) {
  Code.sendXmlToUrl('/saves/.last');
  var code;
  if (NONSECURE) {
    code = Blockly.Python.workspaceToCode(Code.workspace);
  } else {
    var xml = Blockly.Xml.workspaceToDom(Code.workspace);
    code = Blockly.Xml.domToText(xml);
  }

  var onHighlighterConnected = function() {
    // Send code after highlighter websocket is connected.
    $.ajax({
      url: urlToSendTo,
      method: 'POST',
      data: code,
      dataType: 'text'
    })
    .done(function(data, textStatus, jqXHR) {
      console.log('success');
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    });
  };

  Code.startHighlighter(onHighlighterConnected);
};

Code.startHighlighter = function(onConnectFunc) {
  Code.stopHighlighter();

  Code.highlighter = new cozmoWs();

  Code.highlighter.onMessage = function(evt) {
    if (document.getElementById('tab_blocks').className == 'tabon') {
      Code.workspace.highlightBlock(evt.data);
    }
  };
  Code.highlighter.onOpen = function(evt) {
    if (onConnectFunc) {
      onConnectFunc();
    }
  };
  Code.highlighter.onClose = function(evt) {
    Code.workspace.highlightBlock(null);
  };

  var loc = window.location;
  var wsurl = 'ws://' + loc.host + '/highlightSub';
  Code.highlighter.doConnect(wsurl);
}

Code.stopHighlighter = function() {
  if (Code.highlighter) {
    Code.highlighter.doDisconnect();
    Code.highlighter = null;
  }
}

Code.startCamera = function() {
    var canvas = document.getElementById('canvas_cam');
    var context = canvas.getContext("2d");

    Code.camera = new cozmoWs();

    Code.camera.onMessage = function(msg) {
      Code.drawImageBinary(msg.data, canvas, context);
    };

    var loc = window.location;
    var wsurl = 'ws://' + loc.host + '/camSub';
    Code.camera.doConnect(wsurl, true);
}

Code.stopCamera = function() {
  // Disconnect camera WS.
  if (Code.camera) {
    Code.camera.doDisconnect()
    Code.camera = null;
  }
}

Code.sendXmlToUrl = function(urlToSendTo) {
  var xml = Blockly.Xml.workspaceToDom(Code.workspace);
  var text = Blockly.Xml.domToText(xml);

  $.ajax({
    url: urlToSendTo,
    method: 'PUT',
    data: text,
    dataType: 'text'
  })
  .done(function(data, textStatus, jqXHR) {
    console.log('success');
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    alert(errorThrown);
    console.log(errorThrown);
  });
};

Code.loadXmlFromUrl = function(urlToLoadFrom) {
  $.ajax({
    url: urlToLoadFrom,
    method: 'GET',
    data: '',
    dataType: 'text'
  })
  .done(function(data, textStatus, jqXHR) {
    console.log('Loading code: ', data);

    try {
      var xml = Blockly.Xml.textToDom(data);
      Blockly.Xml.domToWorkspace(xml, Code.workspace);
    } catch (e) {
      console.log(e);
      alert(e);
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
    alert(errorThrown);
  });
};

Code.getFiles = function() {
  var filesElem = $('#files');

  filesElem.find('li').remove();

  $.ajax({
    url: '/saves/',
    method: 'GET',
    data: '',
    dataType: 'text'
  })
  .done(function(data, textStatus, jqXHR) {
    var files;
    
    console.log('Got files list: ', data);

    try {
      Code.files = $.parseJSON(data);
      $(Code.files).each(function(num, file) {
        var newItem = $('<li>' + file + '</li>');
        newItem.addClass('ui-widget-content');
        filesElem.append(newItem);
      });
    } catch (e) {
      console.log(e);
      alert(e);
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
    alert(errorThrown);
  });
};

Code.runRemotely = function() {
  Code.sendCodeToUrl('/robot/submit');
}

Code.stopRemoteExecution = function() {
  $.ajax({
    url: '/robot/terminate',
    method: 'POST'
  })
  .done(function(data, textStatus, jqXHR) {
      // Disconnect highlighter WS.
    Code.stopHighlighter();
    console.log('terminated');
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    alert(errorThrown);
    console.log(errorThrown);
  });
};

Code.onFileSaveOpen = function() {
  Code.dialog.dialog('open');
};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function() {
  var count = Code.workspace.getAllBlocks().length;
  if (count < 2 ||
      window.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', count))) {
    Code.workspace.clear();
    // if (window.location.hash) {
    //   window.location.hash = '';
    // }
    window.location.hash = '';
    return true;
  } else {
    return false;
  }
};

// Load the Code demo's language strings.
document.write('<script src="msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="../../msg/js/' + Code.LANG + '.js"></script>\n');

window.addEventListener('load', Code.init);
