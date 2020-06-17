/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( 'YXZ' );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alphaOffset = 0; // radians

	var onDeviceOrientationChangeEvent = function ( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function () {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

		};

	}();

	this.connect = function () {

		onScreenOrientationChangeEvent(); // run once on load

		// iOS 13+

		if ( window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function' ) {

			window.DeviceOrientationEvent.requestPermission().then( function ( response ) {

				if ( response == 'granted' ) {

					window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
					window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

				}

			} ).catch( function ( error ) {

				console.error( 'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error );

			} );

		} else {

			window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
			window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		}

		scope.enabled = true;

	};

	this.disconnect = function () {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function () {

		if ( scope.enabled === false ) return;

		var device = scope.deviceOrientation;

		if ( device ) {

			var alpha = device.alpha ? THREE.MathUtils.degToRad( device.alpha ) + scope.alphaOffset : 0; // Z

			var beta = device.beta ? THREE.MathUtils.degToRad( device.beta ) : 0; // X'

			var gamma = device.gamma ? THREE.MathUtils.degToRad( device.gamma ) : 0; // Y''

			var orient = scope.screenOrientation ? THREE.MathUtils.degToRad( scope.screenOrientation ) : 0; // O

			setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );


		}


	};

	this.dispose = function () {

		scope.disconnect();

	};

	this.connect();

};
THREE.MathUtils = {

    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,

    generateUUID: function() {

        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        var uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' + _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' + _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] + _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

        // .toUpperCase() here flattens concatenated strings to save heap memory space.
        return uuid.toUpperCase();

    },

    clamp: function(value, min, max) {

        return Math.max(min, Math.min(max, value));

    },

    // compute euclidian modulo of m % n
    // https://en.wikipedia.org/wiki/Modulo_operation

    euclideanModulo: function(n, m) {

        return ((n % m) + m) % m;

    },

    // Linear mapping from range <a1, a2> to range <b1, b2>

    mapLinear: function(x, a1, a2, b1, b2) {

        return b1 + (x - a1) * (b2 - b1) / (a2 - a1);

    },

    // https://en.wikipedia.org/wiki/Linear_interpolation

    lerp: function(x, y, t) {

        return (1 - t) * x + t * y;

    },

    // http://en.wikipedia.org/wiki/Smoothstep

    smoothstep: function(x, min, max) {

        if (x <= min)
            return 0;
        if (x >= max)
            return 1;

        x = (x - min) / (max - min);

        return x * x * (3 - 2 * x);

    },

    smootherstep: function(x, min, max) {

        if (x <= min)
            return 0;
        if (x >= max)
            return 1;

        x = (x - min) / (max - min);

        return x * x * x * (x * (x * 6 - 15) + 10);

    },

    // Random integer from <low, high> interval

    randInt: function(low, high) {

        return low + Math.floor(Math.random() * (high - low + 1));

    },

    // Random float from <low, high> interval

    randFloat: function(low, high) {

        return low + Math.random() * (high - low);

    },

    // Random float from <-range/2, range/2> interval

    randFloatSpread: function(range) {

        return range * (0.5 - Math.random());

    },

    degToRad: function(degrees) {

        return degrees * THREE.MathUtils.DEG2RAD;

    },

    radToDeg: function(radians) {

        return radians * THREE.MathUtils.RAD2DEG;

    },

    isPowerOfTwo: function(value) {

        return (value & (value - 1)) === 0 && value !== 0;

    },

    ceilPowerOfTwo: function(value) {

        return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));

    },

    floorPowerOfTwo: function(value) {

        return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));

    },

    setQuaternionFromProperEuler: function(q, a, b, c, order) {

        // Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

        // rotations are applied to the axes in the order specified by 'order'
        // rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
        // angles are in radians

        var cos = Math.cos;
        var sin = Math.sin;

        var c2 = cos(b / 2);
        var s2 = sin(b / 2);

        var c13 = cos((a + c) / 2);
        var s13 = sin((a + c) / 2);

        var c1_3 = cos((a - c) / 2);
        var s1_3 = sin((a - c) / 2);

        var c3_1 = cos((c - a) / 2);
        var s3_1 = sin((c - a) / 2);

        switch (order) {

        case 'XYX':
            q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
            break;

        case 'YZY':
            q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
            break;

        case 'ZXZ':
            q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
            break;

        case 'XZX':
            q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
            break;

        case 'YXY':
            q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
            break;

        case 'ZYZ':
            q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
            break;

        default:
            console.warn('THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + order);

        }

    }

};
