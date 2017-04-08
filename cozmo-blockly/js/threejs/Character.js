
var Animation = class {
  constructor(mesh, elemAnimate) {
    this.startTime = null;
    this.running = true;
    this.local = elemAnimate.local;
    this.andBack = elemAnimate.andBack;
    this.loop = elemAnimate.loop;
    this.anglesStart = elemAnimate.anglesStart;
    this.anglesStop = elemAnimate.anglesStop;
    this.duration = elemAnimate.duration > 0 ? elemAnimate.duration * 1000 : 1;
    this.forward = true;
    this.anglesDiff = {
      x: (this.anglesStop.mx - this.anglesStart.mx) / this.duration,
      y: (this.anglesStop.my - this.anglesStart.my) / this.duration,
      z: (this.anglesStop.mz - this.anglesStart.mz) / this.duration
    };
    this.mesh = mesh;

    this.next = function(currTime) {
      if (!this.running) {
        return;
      }
      if (!this.startTime) {
        this.startTime = Date.now();
        return;
      }
      var time;
      if (this.forward) {
        time = currTime - this.startTime;
      } else {
        time = this.startTime + this.duration - currTime;
      }
      if (time > this.duration && this.forward) {
        if (this.andBack) {
          this.forward = false;
          this.startTime = currTime;
          return;
        } else if (this.loop) {
          this.startTime = currTime;
        } else {
          this.running = false;
        }
      } else if (time <= 0) {
        if (this.loop) {
          this.forward = true;
          this.startTime = currTime;
          return;
        } else {
          this.running = false;
        }
      }
      var quat = new THREE.Quaternion();
      var euler = new THREE.Euler(
        deg2rad(this.anglesStart.mx + this.anglesDiff.x * time),
        deg2rad(this.anglesStart.mz + this.anglesDiff.z * time),
        deg2rad(this.anglesStart.my + this.anglesDiff.y * time),
        'XYZ');
      quat.setFromEuler(euler);
      if (this.local) {
        quat = this.mesh.originQuat.clone().multiply(quat);
      } else {
        quat = quat.multiply(this.mesh.originQuat);
      }
      this.mesh.quaternion.copy(quat);
      // console.log(this.forward, time, quat);
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

    function populateElements(texture, cMaterial) {
      var container = new THREE.Object3D();
      for (var i = 0; i < elements.length; i++) {
        var elem = elements[i];
        var elemT = elem.texture;
        var size = elem.size;
        var mesh;
        if (elemT && texture) {
          var mesh = createCuboid(size.width, size.height, size.depth, cMaterial);
          var geometry = mesh.geometry;
          geometry.faceVertexUvs[0] = [];
          mapUv(geometry, texture, 0, elemT.left)
          mapUv(geometry, texture, 1, elemT.right)
          mapUv(geometry, texture, 2, elemT.top)
          mapUv(geometry, texture, 3, elemT.bottom)
          mapUv(geometry, texture, 4, elemT.front)
          mapUv(geometry, texture, 5, elemT.back)
        } else {
          var colorStr = elem.color.replace('#', '');
          var color = parseInt(colorStr, 16);
          var elemMaterial = new THREE.MeshLambertMaterial( { color: color, side: THREE.FrontSide, transparent: true } );
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
          mesh = newMesh;
        }

        var moveby = elem.moveby
        translate(mesh, moveby.mx, moveby.mz, moveby.my);

        var elemAnimate = elem.animate;
        if (elemAnimate) {
          var pivot = elemAnimate.pivot;
          var anglesStart = elemAnimate.anglesStart;
          var anglesStop = elemAnimate.anglesStop;
          var duration = elemAnimate.duration;
          var newMesh = new THREE.Object3D();

          var pos = mesh.position;
          translate(newMesh, pivot.mx + pos.x, pivot.mz + pos.y, pivot.my + pos.z);
          mesh.position.set(-pivot.mx, -pivot.mz, -pivot.my);

          var quat = mesh.quaternion;
          newMesh.originQuat = quat.clone();
          rotate(mesh, 0, 0, 0);
          newMesh.quaternion.copy(quat);

          animations.push(new Animation(newMesh, elemAnimate));
          newMesh.add(mesh);
          mesh = newMesh;
        }

        container.add(mesh);
      }

      var charRotate = character.rotate;
      if (charRotate) {
        var pivot = charRotate.pivot;
        var angles = charRotate.angles;
        var newContainer = new THREE.Object3D();
        root.add(newContainer);
        translate(newContainer, pivot.mx, pivot.mz, pivot.my);
        translate(container, -pivot.mx, -pivot.mz, -pivot.my);
        newContainer.add(container);
        rotate(newContainer, angles.mx, angles.mz, angles.my);
        container = newContainer;
      } else {
        root.add(container);
      }

      var charScale = character.scale;
      if (charScale) {
        var scale = charScale / 100.0;
        container.scale.set(scale, scale, scale);
        // Precompute geometry (a questionable optimization). Requires moving things around
        // container.traverse(function(obj) {
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
          translate(container, charMoveby.mx * scale, charMoveby.mz * scale, charMoveby.my * scale);
        } else {
          translate(container, charMoveby.mx, charMoveby.mz, charMoveby.my);
        }
      }
    }

    var charT = character.texture;
    if (charT) {
      var tmpTxture = CozmoBlockly.loadTexture('custom-textures/' + charT + '.png', function(texture) {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        var cMaterial = new THREE.MeshLambertMaterial({
            transparent: true,
            map: texture
        });
        materials.push(cMaterial);

        populateElements(texture, cMaterial);
      });
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
};
