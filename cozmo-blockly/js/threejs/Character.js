
CozmoBlockly.Character = class extends CozmoBlockly.Dynamic {
  constructor(scene, character) {
    super(scene, 0, 0, 0);

    this.convertPose = CozmoBlockly.aruco2threejs.pose;
    this.id = character.id;
    var materials = [];
    var root = new THREE.Object3D();
    var elements = character.elements;

    var charT = character.texture;
    var cMaterial;
    if (charT) {
      var tmpTxture = CozmoBlockly.loadTexture('custom-textures/' + charT + '.png', function(texture) {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        cMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            map: texture
        });
        materials.push(cMaterial);

        for (var i = 0; i < elements.length; i++) {
          var elem = elements[i];
          var elemT = elem.texture;
          var size = elem.size;
          if (elemT) {
            var mesh = createCuboid(size.width, size.height, size.depth, cMaterial);
            var geometry = mesh.geometry;
            geometry.faceVertexUvs[0] = [];
            mapUv(geometry, texture, 0, elemT.left)
            mapUv(geometry, texture, 1, elemT.right)
            mapUv(geometry, texture, 2, elemT.top)
            mapUv(geometry, texture, 3, elemT.bottom)
            mapUv(geometry, texture, 4, elemT.front)
            mapUv(geometry, texture, 5, elemT.back)

            root.add(mesh);
            var moveby = elem.moveby
            translate(mesh, moveby.mx, moveby.mz, moveby.my);
          }
        }
      });
    } else {
      for (var i = 0; i < elements.length; i++) {
        var elem = elements[i];
        var size = elem.size;
        var mesh;
        var colorStr = elem.color.replace('#', '');
        var color = parseInt(colorStr, 16);
        var elemMaterial = new THREE.MeshLambertMaterial( { color: color, side: THREE.FrontSide, transparent: true } );
        materials.push(elemMaterial);
        mesh = createCuboid(size.width, size.height, size.depth, elemMaterial);

        root.add(mesh);
        var moveby = elem.moveby
        translate(mesh, moveby.mx, moveby.mz, moveby.my);
      }
    }

    this.mesh = root;

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
    }
  }

}

function translateOnAxis( obj, axis, distance ) {
  obj.position.add( axis.multiplyScalar( distance ) );
}

function translateX(obj, distance) {
  translateOnAxis( obj, new THREE.Vector3( 1, 0, 0 ), distance );
};

function translateY(obj, distance) {
  translateOnAxis( obj, new THREE.Vector3( 0, 1, 0 ), distance );
};

function translateZ(obj, distance) {
  translateOnAxis( obj, new THREE.Vector3( 0, 0, 1 ), distance );
};

function translate(obj, x, y, z) {
  obj.position.add(new THREE.Vector3(x, y, z));
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
  var xmin = Math.min(x1, x2) * tileUvW;
  var xmax = (Math.max(x1, x2) + 1) * tileUvW;
  var ymin = (imgHeight - Math.min(y1, y2)) * tileUvH;
  var ymax = (imgHeight - Math.max(y1, y2) - 1) * tileUvH;
  var XminYmin = new THREE.Vector2(xmin, ymin);
  var XmaxYmin = new THREE.Vector2(xmax, ymin);
  var XmaxYmax = new THREE.Vector2(xmax, ymax);
  var XminYmax = new THREE.Vector2(xmin, ymax);
  if (points.mirrored) {
    geometry.faceVertexUvs[0][faceIdx * 2] = [XmaxYmin, XmaxYmax, XminYmin];
    geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [XmaxYmax, XminYmax, XminYmin];
  } else {
    geometry.faceVertexUvs[0][faceIdx * 2] = [XminYmin, XminYmax, XmaxYmin];
    geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [XminYmax, XmaxYmax, XmaxYmin];
  }
};
