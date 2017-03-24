
THREE.Calibrator = function ( domElement ) {

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.enabled = true;
	// XMINUS: B, XPLUS: N, YMINUS: G, YPLUS: H, ZMINUS: T, ZPLUS: Y
	this.keys = { XMINUS: 66, XPLUS: 78, YMINUS: 71, YPLUS: 72, ZMINUS: 84, ZPLUS: 89 };
	this.dirty = true;
	this.euler = new THREE.Euler( 0, 0, 0, 'XYZ' );
	this.quaternion = new THREE.Quaternion();

	var scope = this;
	var EPS = 0.000001;
	var increment = 0.01;

	//
	// public methods
	//

	// this.getQuaternion = function () {
	// 	if (scope.dirty) {
	// 		scope.quaternion = new THREE.Quaternion().setFromEuler(scope.euler);
	// 		scope.dirty = false;
	// 	}
	// 	// console.log( 'getQuaternion' );
	// 	return scope.quaternion;
	// };

	this.adjustQuaternion = function(quat) {
		quat.multiply(scope.getQuaternion()).normalize();
	}

	this.getEuler = function () {
		scope.dirty = false;
		return scope.euler;
	};

	this.isDirty = function() {
		// console.log( 'isDirty', scope.dirty );
		return scope.dirty;
	}

	this.reset = function () {
		scope.euler = new THREE.Euler(0, 0, 0, 'XYZ');
		scope.dirty = true;
	};

	this.dispose = function () {
		window.removeEventListener( 'keydown', onKeyDown, false );
	};

	//
	// internals
	//

	function rotateX(by) {
		scope.euler.x += by;
		scope.dirty = true;
	}

	function rotateY(by) {
		scope.euler.z += by;
		scope.dirty = true;
	}

	function rotateZ(by) {
		scope.euler.y += by;
		scope.dirty = true;
	}

	function onKeyDown( event ) {

		// console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.XMINUS:
				rotateX(-increment);
				break;

			case scope.keys.XPLUS:
				rotateX(increment);
				break;

			case scope.keys.YMINUS:
				rotateY(-increment);
				break;

			case scope.keys.YPLUS:
				rotateY(increment);
				break;

			case scope.keys.ZMINUS:
				rotateZ(-increment);
				break;

			case scope.keys.ZPLUS:
				rotateZ(increment);
				break;

		}

	}

	window.addEventListener( 'keydown', onKeyDown, false );

}
