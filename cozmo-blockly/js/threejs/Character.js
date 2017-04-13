
var Animation = class {
  constructor(mesh, elemAnimate) {
    this.startTime = null;
    this.initialized = false;
    this.running = false;
    this.name = elemAnimate.name;
    this.local = elemAnimate.local;
    this.andBack = elemAnimate.andBack;
    this.loop = elemAnimate.loop;
    this.anglesStart = elemAnimate.anglesStart;
    this.anglesStop = elemAnimate.anglesStop;
    this.duration = elemAnimate.duration > 0 ? elemAnimate.duration * 1000 : 1;
    this.origQuat = mesh.quaternion.clone();
    this.forward = true;
    this.anglesDiff = {
      x: (this.anglesStop.mx - this.anglesStart.mx) / this.duration,
      y: (this.anglesStop.my - this.anglesStart.my) / this.duration,
      z: (this.anglesStop.mz - this.anglesStart.mz) / this.duration
    };
    this.mesh = mesh;
    var that = this;

    this.next = function(currTime) {
      if (!that.running) {
        return;
      }
      if (!that.startTime) {
        that.startTime = Date.now();
        return;
      }
      var time;
      if (that.forward) {
        time = currTime - that.startTime;
      } else {
        time = that.startTime + that.duration - currTime;
      }
      if (time > that.duration && that.forward) {
        if (that.andBack) {
          that.forward = false;
          that.startTime = currTime;
          return;
        } else if (that.loop) {
          that.startTime = currTime;
        } else {
          that.running = false;
        }
      } else if (time <= 0) {
        if (that.loop) {
          that.forward = true;
          that.startTime = currTime;
          return;
        } else {
          that.running = false;
        }
      }
      var quat = new THREE.Quaternion();
      var euler = new THREE.Euler(
        deg2rad(that.anglesStart.mx + that.anglesDiff.x * time),
        deg2rad(that.anglesStart.mz + that.anglesDiff.z * time),
        deg2rad(that.anglesStart.my + that.anglesDiff.y * time),
        'XYZ');
      quat.setFromEuler(euler);
      quat = that.origQuat.clone().multiply(quat);
      that.mesh.quaternion.copy(quat);
      // console.log('after', that.forward, time, quat, that.origQuat);
    };

    this.start = function() {
      if (!that.initialized) {
        that.initialized = true;
        that.origQuat = mesh.quaternion.clone();
      }
      that.running = true;
    };

    this.stop = function() {
      that.running = false;
      that.startTime = null;
      that.forward = true;
    };

  };

}

var AnimationParallel = class {
  constructor(data, animations) {
    this.name = data.name;
    this.animations = animations;
    this.running = false;
    var that = this;

    this.next = function(currTime) {
      if (!that.running) {
        return;
      }
      that.animations.forEach(function(elem) {
        elem.next(currTime);
      });
    };

    this.start = function() {
      that.running = true;
      that.animations.forEach(function(elem) {
        elem.start();
      });
    };

    this.stop = function() {
      that.running = false;
      that.animations.forEach(function(elem) {
        elem.stop();
      });
    };

  };

}

CozmoBlockly.Character = class extends CozmoBlockly.Dynamic {
  constructor(scene, character) {
    super(scene, 0, 0, 0);

    this.convertPose = CozmoBlockly.aruco2threejs.pose;
    this.id = character.id;
    var materials = [];
    var animations = [];
    var root = new THREE.Object3D();
    var elements = character.elements;

    var that = this;

    function populateElements(texture, cMaterial, callbacks) {
      that.container = new THREE.Object3D();
      for (var i = 0; i < elements.length; i++) {
        var elem = elements[i];
        var elemT = elem.texture;
        var size = elem.size;
        var mesh;
        if (elemT && texture) {
          var mesh = createCuboid(size.width, size.height, size.depth, cMaterial);
          var geometry = mesh.geometry;
          geometry.faceVertexUvs[0] = [];
          callbacks.push(mapUv.bind(that, geometry, texture, 0, elemT.left));
          callbacks.push(mapUv.bind(that, geometry, texture, 1, elemT.right));
          callbacks.push(mapUv.bind(that, geometry, texture, 2, elemT.top));
          callbacks.push(mapUv.bind(that, geometry, texture, 3, elemT.bottom));
          callbacks.push(mapUv.bind(that, geometry, texture, 4, elemT.front));
          callbacks.push(mapUv.bind(that, geometry, texture, 5, elemT.back));
        } else {
          var colorStr = elem.color.replace('#', '');
          var color = parseInt(colorStr, 16);
          var elemMaterial = new THREE.MeshLambertMaterial( { color: color, side: THREE.FrontSide, transparent: true, overdraw: 0.5 } );
          materials.push(elemMaterial);
          mesh = createCuboid(size.width, size.height, size.depth, elemMaterial);
        }

        var elemRotate = elem.rotate;
        if (elemRotate) {
          var pivot = elemRotate.pivot;
          var angles = elemRotate.angles;
          var newMesh = new THREE.Object3D();
          var pos = mesh.position;
          translate(newMesh, pivot.mx + pos.x, pivot.mz + pos.y, pivot.my + pos.z);
          mesh.position.set(-pivot.mx, -pivot.mz, -pivot.my);
          rotate(newMesh, angles.mx, angles.mz, angles.my);
          newMesh.add(mesh);
          if (elemRotate.displayAxes) {
            var axisHelper = new THREE.AxisHelper(60);
            newMesh.add(axisHelper);
          }
          mesh = newMesh;
        }

        var moveby = elem.moveby
        translate(mesh, moveby.mx, moveby.mz, moveby.my);

        if (elem.animations) {
          // console.log('adding animations', elem.animations);
          for (var j = 0; j < elem.animations.length; j++) {
            mesh = addAnimation(elem.animations[j], mesh, animations);
          }
        }

        that.container.add(mesh);
      }

      if (character.animations) {
        character.animations.forEach(function(animation) {
          that.container = addAnimation(animation, that.container, animations);
        });
      }

      var charRotate = character.rotate;
      if (charRotate) {
        var pivot = charRotate.pivot;
        var angles = charRotate.angles;
        var newContainer = new THREE.Object3D();
        translate(newContainer, pivot.mx, pivot.mz, pivot.my);
        translate(that.container, -pivot.mx, -pivot.mz, -pivot.my);
        newContainer.add(that.container);
        rotate(newContainer, angles.mx, angles.mz, angles.my);
        if (charRotate.displayAxes) {
          var axisHelper = new THREE.AxisHelper(60);
          newContainer.add(axisHelper);
        }
        that.container = newContainer;
      }

      var charScale = character.scale;
      if (charScale) {
        var scale = charScale / 100.0;
        that.container.scale.set(scale, scale, scale);
        // Precompute geometry (a questionable optimization). Requires moving things around
        // that.container.traverse(function(obj) {
        //   if (obj.geometry) {
        //     // console.log(obj.geometry.scale);
        //     obj.geometry.scale(scale, scale, scale);
        //   }
        // });
      }

      var charMoveby = character.moveby;
      if (charMoveby) {
        if (charScale) {
          var scale = charScale / 100.0;
          translate(that.container, charMoveby.mx * scale, charMoveby.mz * scale, charMoveby.my * scale);
        } else {
          translate(that.container, charMoveby.mx, charMoveby.mz, charMoveby.my);
        }
      }

      root.add(that.container);
    }

    var charT = character.texture;
    if (charT) {
      var callbacks = [];
      var tmpTxture = CozmoBlockly.loadTexture('custom-textures/' + charT + '.png', function(texture) {
        callbacks.forEach(function(callback) {
          callback();
        });
      });
      tmpTxture.magFilter = THREE.NearestFilter;
      tmpTxture.minFilter = THREE.NearestFilter;

      var cMaterial = new THREE.MeshLambertMaterial({
          transparent: true,
          map: tmpTxture,
          overdraw: 0.5
      });
      materials.push(cMaterial);

      populateElements(tmpTxture, cMaterial, callbacks);
    } else {
      populateElements();
    }

    this.mesh = root;

    this.animate = function() {
      var now = Date.now();
      for (var i = 0; i < animations.length; i++) {
        var animation = animations[i];
        animation.next(now);
      }
    };

    this.animationStart = function(name) {
      for (var i = 0; i < animations.length; i++) {
        var animation = animations[i];
        if (animation.name === name) {
          animation.start();
        }
      }
    };

    this.animationStop = function(name) {
      for (var i = 0; i < animations.length; i++) {
        var animation = animations[i];
        if (animation.name === name) {
          animation.stop();
        }
      }
    };

    this.setOpacity = function(opacity) {
      if (opacity == 0) {
        this.mesh.visible = false;
      } else {
        this.mesh.visible = true;
        for (var i = 0; i < materials.length; i++) {
          var material = materials[i];
          material.opacity = opacity;
        }
      }
    };
  }

}

// function translateOnAxis( obj, axis, distance ) {
//   obj.position.add( axis.multiplyScalar( distance ) );
// }

// function translateX(obj, distance) {
//   translateOnAxis( obj, new THREE.Vector3( 1, 0, 0 ), distance );
// };

// function translateY(obj, distance) {
//   translateOnAxis( obj, new THREE.Vector3( 0, 1, 0 ), distance );
// };

// function translateZ(obj, distance) {
//   translateOnAxis( obj, new THREE.Vector3( 0, 0, 1 ), distance );
// };

function addAnimation(animData, animMesh, animCollection) {
  if (animData.kind === 'parallel') {
    var nextMesh = animMesh;
    var parallelAnimations = [];
    for (var k = 0; k < animData.animations.length; k++) {
      nextMesh = addAnimation(animData.animations[k], nextMesh, parallelAnimations);
    }
    animCollection.push(new AnimationParallel(animData, parallelAnimations));
    return nextMesh;
  }

  var pivot = animData.pivot;
  var anglesStart = animData.anglesStart;
  var anglesStop = animData.anglesStop;
  var duration = animData.duration;
  var newMesh = new THREE.Object3D();

  var pivotVec = new THREE.Vector3(pivot.mx, pivot.mz, pivot.my);
  // console.log('1', pivotVec);
  var meshWorldPos = animMesh.getWorldPosition();
  // console.log('2', meshWorldPos, animMesh.position);
  var newAnimMeshPos = pivotVec.clone().negate();

  newMesh.position.copy(meshWorldPos.clone().add(pivotVec));
  if (animData.local) {
    animMesh.position.set(0, 0, 0);
    animMesh.updateMatrixWorld(true);
    animMesh.worldToLocal(newAnimMeshPos);
  }
  animMesh.position.copy(newAnimMeshPos);
  // console.log('3', newMesh.position, animMesh.position);

  if (animData.local) {
    newMesh.quaternion.copy(animMesh.quaternion);
    rotate(animMesh, 0, 0, 0);
  }

  animCollection.push(new Animation(newMesh, animData));
  if (animData.displayAxes) {
    var axisHelper = new THREE.AxisHelper(60);
    newMesh.add(axisHelper);
  }

  newMesh.add(animMesh);

  return newMesh;
}

function translate(obj, x, y, z) {
  obj.position.add(new THREE.Vector3(x, y, z));
};

function deg2rad(deg) {
  return deg * Math.PI / 180;
};

function rotate(obj, x, y, z) {
  var euler = new THREE.Euler(deg2rad(x), deg2rad(y), deg2rad(z), 'XYZ');
  obj.setRotationFromEuler(euler);
};

function createCuboid(w, h, d, material) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  // set the geometry.dynamic by default
  geometry.dynamic = true;
  return new THREE.Mesh(geometry, material)
};

function mapUv(geometry, texture, faceIdx, points) {
  var x1 = points.x1;
  var y1 = points.y1;
  var x2 = points.x2;
  var y2 = points.y2;
  var imgWidth = texture.image.width;
  var imgHeight = texture.image.height;
  var tileUvW = 1/imgWidth;
  var tileUvH = 1/imgHeight;
  // var xmin = Math.min(x1, x2) * tileUvW;
  // var xmax = (Math.max(x1, x2) + 1) * tileUvW;
  // var ymin = (imgHeight - Math.min(y1, y2)) * tileUvH;
  // var ymax = (imgHeight - Math.max(y1, y2) - 1) * tileUvH;
  // var XminYmin = new THREE.Vector2(xmin, ymin);
  // var XmaxYmin = new THREE.Vector2(xmax, ymin);
  // var XmaxYmax = new THREE.Vector2(xmax, ymax);
  // var XminYmax = new THREE.Vector2(xmin, ymax);
  // if (points.mirrored) {
  //   geometry.faceVertexUvs[0][faceIdx * 2] = [XmaxYmin, XmaxYmax, XminYmin];
  //   geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [XmaxYmax, XminYmax, XminYmin];
  // } else {
  //   geometry.faceVertexUvs[0][faceIdx * 2] = [XminYmin, XminYmax, XmaxYmin];
  //   geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [XminYmax, XmaxYmax, XmaxYmin];
  // }
  var X1 = x1 * tileUvW;
  var X2 = (x2 + 1) * tileUvW;
  var Y1 = (imgHeight - y1) * tileUvH;
  var Y2 = (imgHeight - y2 - 1) * tileUvH;
  var X1Y1 = new THREE.Vector2(X1, Y1);
  var X2Y1 = new THREE.Vector2(X2, Y1);
  var X2Y2 = new THREE.Vector2(X2, Y2);
  var X1Y2 = new THREE.Vector2(X1, Y2);
  if (points.mirrored) {
    geometry.faceVertexUvs[0][faceIdx * 2] = [X2Y1, X2Y2, X1Y1];
    geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [X2Y2, X1Y2, X1Y1];
  } else {
    geometry.faceVertexUvs[0][faceIdx * 2] = [X1Y1, X1Y2, X2Y1];
    geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [X1Y2, X2Y2, X2Y1];
  }
  geometry.elementsNeedUpdate = true;
};
