
CozmoBlockly.Character = class extends CozmoBlockly.Dynamic {
  constructor(scene, character) {
    super(scene, 0, 0, 0);

    this.convertPose = CozmoBlockly.aruco2threejs.pose;
    this.id = character.id;
    var materials = [];
    var root = new THREE.Object3D();
    var elements = character.elements;

    var charT = character.texture;
    var texture;
    var cMaterial;
    if (charT) {
      texture = CozmoBlockly.loadTexture('custom-textures/' + charT + '.png');
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      // this._tTexture = tTexture

      cMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          map: texture
      });
      materials.push(cMaterial);
    }

    for (var i = 0; i < elements.length; i++) {
      var elem = elements[i];
      var elemT = elem.texture;
      var size = elem.size;
      var mesh;
      if (charT && elemT) {
        mesh = createCuboid(size.width, size.height, size.depth, cMaterial);
        var geometry = mesh.geometry;
        geometry.faceVertexUvs[0] = [];
        mapUv(geometry, 0, 16, 24, 24, 16) // left
        mapUv(geometry, 1,  0, 24,  8, 16) // right
        mapUv(geometry, 2,  8, 32, 16, 24) // top
        mapUv(geometry, 3, 16, 32, 24, 24) // bottom
        mapUv(geometry, 4,  8, 24, 16, 16) // front
        mapUv(geometry, 5, 24, 24, 32, 16) // back
      } else {
        var colorStr = elem.color.replace('#', '');
        var color = parseInt(colorStr, 16);
        var elemMaterial = new THREE.MeshLambertMaterial( { color: color, side: THREE.FrontSide, transparent: true } );
        materials.push(elemMaterial);
        mesh = createCuboid(size.width, size.height, size.depth, elemMaterial);
      }
      root.add(mesh);
      var moveby = elem.moveby
      translate(mesh, moveby.mx, moveby.mz, moveby.my);
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
  geometry.dynamic= true;
  return new THREE.Mesh(geometry, material)
};

function mapUv(geometry, faceIdx, x1, y1, x2, y2) {
  var tileUvW = 1/64;
  var tileUvH = 1/32;
  var x1y1 = new THREE.Vector2(x1 * tileUvW, y1 * tileUvH);
  var x2y1 = new THREE.Vector2(x2 * tileUvW, y1 * tileUvH);
  var x2y2 = new THREE.Vector2(x2 * tileUvW, y2 * tileUvH);
  var x1y2 = new THREE.Vector2(x1 * tileUvW, y2 * tileUvH);
  geometry.faceVertexUvs[0][faceIdx * 2] = [x1y2, x1y1, x2y2];
  geometry.faceVertexUvs[0][faceIdx * 2 + 1] = [x1y1, x2y1, x2y2];
};
