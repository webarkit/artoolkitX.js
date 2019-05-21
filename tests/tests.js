import ARController from "../SDK/lib/artoolkitX.api.js";

window.addEventListener("artoolkitX-loaded", () => {
    QUnit.module("ARController creation test", hooks => {
        hooks.afterEach(function (assert) {
            if (window.arController)
                window.arController.dispose();
        });
        QUnit.test("Create object and load camera parameter", function (assert) {
            const cParaUrl = "./camera_para.dat";
            const done = assert.async();
            try {
                const arController = new ARController(new Image(800, 600), cParaUrl);
                arController.start().then(() => {
                    assert.ok(true, "Successfully created ARController");
                    assert.equal(
                        arController.cameraParaFileURL,
                        cParaUrl,
                        "Camera para URL is equal to: " + cParaUrl
                    );
                    window.arController = arController;
                    done();
                });
            } catch (error) {
                assert.ok(false, "Failed to create ARController");
            }
        });
        QUnit.test("Create object and fail to load camera parameter", function (
            assert
        ) {
            const cParaUrl = "./camera_para_error.dat";
            const done = assert.async();
            try {
                window.arController = new ARController(new Image(800, 600), cParaUrl);
                window.arController
                    .start()
                    .then(() => {
                        assert.ok(false, "Successfully created ARController");
                        assert.equal(
                            window.arController.cameraParaFileURL,
                            cParaUrl,
                            "Camera para URL is equal to: " + cParaUrl
                        );
                        done();
                    })
                    .catch(e => {
                        assert.ok(
                            true,
                            "Failed to create ARController with cPara: " + cParaUrl
                        );
                        window.arController = undefined;
                        done();
                    });
            } catch (error) {
                assert.ok(false);
                done();
            }
        });
    });

    /* #### ARController Module #### */
    QUnit.module("ARController", {
        beforeEach: function (assert) {
            window.timeout = 5000;
            window.cParaUrl = "./camera_para.dat";
            window.checkDefault = arController => {
                assert.ok(arController);
                assert.deepEqual(
                    arController.orientation,
                    "landscape",
                    "Check the default values: landscape"
                );
                assert.deepEqual(
                    arController.listeners,
                    {},
                    "Check the default values: listeners"
                );
                assert.deepEqual(
                    arController.defaultMarkerWidth,
                    80,
                    "Check the default values: defaultMarkerWidth"
                );
                assert.ok(
                    Array.isArray(arController.trackables),
                    "Check Array.isArray(trackables)"
                );
                assert.deepEqual(
                    arController.trackables.length,
                    0,
                    "Check the default values: trackables.length===0"
                );
                assert.deepEqual(
                    arController.transform_mat,
                    new Float64Array(16),
                    "Check the default values: transform_mat"
                );
                assert.deepEqual(
                    arController.cameraParaFileURL,
                    window.cParaUrl,
                    "Check camera para url set correctly"
                );
                assert.ok(arController.canvas, "Check the default values: canvas");
                assert.ok(arController.ctx, "Check the default values: ctx");
            };
        },
        afterEach: function (assert) {
            window.arController.dispose();
        }
    });

    QUnit.test("Create ARController default", assert => {
        const videoWidth = 640,
            videoHeight = 480;
        const done = assert.async();
        const image = new Image(videoWidth, videoHeight);
        assert.timeout(window.timeout);
        try {
            const arController = new ARController(image, window.cParaUrl);
            window.checkDefault(arController);
            arController
                .start()
                .then(() => {
                    assert.deepEqual(
                        arController.videoWidth,
                        videoWidth,
                        "Check the default values: videoWidth"
                    );
                    assert.deepEqual(
                        arController.videoHeight,
                        videoHeight,
                        "Check the default values: videoHeight"
                    );
                    assert.deepEqual(
                        arController.image,
                        image,
                        "Check the default values: image === undefined"
                    );

                    assert.deepEqual(
                        arController.canvas.width,
                        videoWidth,
                        "Check the default values: canvas.width"
                    );
                    assert.deepEqual(
                        arController.canvas.height,
                        videoHeight,
                        "Check the default values: canvas.height"
                    );
                })
                .catch(e => {
                    assert.ok(false);
                }).finally(() => {
                    window.arController = arController;
                    done();
                });
        } catch (e) {
            assert.ok(false);
            done();
        }
    });

    QUnit.test("Create ARController track single image", assert => {
        const done = assert.async();
        let t0;
        assert.timeout(window.timeout);

        const arController = new ARController(v1, window.cParaUrl);
        window.checkDefault(arController);
        arController.addEventListener("getMarker", trackableInfo => {
            const t1 = performance.now();
            assert.ok(
                t1 - t0 < 100,
                "Detect marker returns within expected time < 100ms actual: " +
                (t1 - t0)
            );
        });
        arController
            .start()
            .then(success => {
                assert.ok(true, "successfully loaded");
                assert.deepEqual(
                    arController.cameraParaFileURL,
                    window.cParaUrl,
                    "Check the default values: cameraPara"
                );
                assert.deepEqual(
                    arController.image,
                    v1,
                    "Check the default values: image"
                );
                assert.deepEqual(
                    arController.videoWidth,
                    v1.width,
                    "Check the default values: image.width"
                );
                assert.deepEqual(
                    arController.videoHeight,
                    v1.height,
                    "Check the default values: image.height"
                );

                assert.deepEqual(
                    arController.canvas.width,
                    v1.width,
                    "Check the default values: canvas.width"
                );
                assert.deepEqual(
                    arController.canvas.height,
                    v1.height,
                    "Check the default values: canvas.height"
                );

                t0 = performance.now();
                arController.process();
            })
            .catch(e => {
                assert.ok(false);
            }).finally(() => {
                window.arController = arController;
                done();
            });
    });

    // /* #### ARController.getUserMedia module #### */
    QUnit.module("ARController getUserMedia", {
        afterEach: assert => {
            if (window.video.srcObject) {
                const track = window.video.srcObject.getTracks()[0];
                track.stop();
                window.video.srcObject = null;
            }
            window.video.src = null;
        }
    });
    QUnit.test("getUserMedia", assert => {
        const width = 640;
        const height = 480;
        const facingMode = "environment";

        const configuration = {
            width: width,
            height: height,
            facingMode: facingMode
        };
        assert.timeout(10000);
        const done = assert.async();
        try {
            ARController.getUserMedia(configuration).then(video => {
                // Add the video element to html
                document.body.appendChild(video);
                assert.ok(video, "Successfully created video element");
                assert.ok(video.srcObject, "Check the source object");
                assert.deepEqual(
                    video.srcObject.getTracks().length,
                    1,
                    "Ensure we only get one Track back ... "
                );
                assert.deepEqual(
                    video.srcObject.getVideoTracks().length,
                    1,
                    ".. and that that track is of type 'video'"
                );
                const videoTrack = video.srcObject.getVideoTracks()[0];
                console.log("videoTrack.label: " + videoTrack.label);

                assert.ok(
                    videoTrack.getSettings(),
                    "Check if the video track has settings available"
                );
                const videoTrackSettings = videoTrack.getSettings();
                assert.deepEqual(
                    videoTrackSettings.width,
                    width,
                    "Video width from constraints"
                );
                assert.deepEqual(
                    videoTrackSettings.height,
                    height,
                    "Video height from constraints"
                );

                const supported = navigator.mediaDevices.getSupportedConstraints();
                // Mobile supports facingMode to be set. Desktop states that facingMode is supported but doesn't list the facing mode inside the settings and hence it will fail
                if (supported["facingMode"] && videoTrackSettings.facingMode)
                    assert.deepEqual(
                        videoTrackSettings.facingMode,
                        facingMode,
                        "Video facing mode from constraints"
                    );

                // Don't check video.src anymore because it should not be available in modern browsers
                window.video = video;
                done();
            });
        } catch (error) {
            assert.notOk(error);
            done();
        }
    });
    QUnit.test("getUserMedia with max/min constraints", assert => {
        const width = { min: 320, max: 640 };
        const height = { min: 240, max: 480 };
        const facingMode = { ideal: "environment" };
        const configuration = {
            width: width,
            height: height,
            facingMode: facingMode
        };
        assert.timeout(10000);
        const done = assert.async();
        try {
            ARController.getUserMedia(configuration).then(video => {
                assert.ok(video, "The created video element");
                window.video = video;
                const videoTrack = video.srcObject.getVideoTracks()[0];
                const videoTrackSettings = videoTrack.getSettings();
                assert.deepEqual(
                    videoTrackSettings.width,
                    width.max,
                    "Video width from constraints"
                );
                assert.deepEqual(
                    videoTrackSettings.height,
                    height.max,
                    "Video height from constraints"
                );
                done();
            });
        } catch (error) {
            assert.notOk(error);
            done();
        }
    });
    QUnit.test("getUserMedia with ideal constraints", assert => {
        const width = { min: 320, ideal: 640 };
        const height = { min: 240, ideal: 480 };
        const facingMode = { ideal: "environment" };
        const configuration = {
            width: width,
            height: height,
            facingMode: facingMode
        };
        assert.timeout(10000);
        const done = assert.async();
        try {
            video = ARController.getUserMedia(configuration).then(video => {
                assert.ok(video, "The created video element");
                window.video = video;
                const videoTrack = video.srcObject.getVideoTracks()[0];
                const videoTrackSettings = videoTrack.getSettings();
                assert.deepEqual(
                    videoTrackSettings.width,
                    width.ideal,
                    "Video width from constraints"
                );
                assert.deepEqual(
                    videoTrackSettings.height,
                    height.ideal,
                    "Video height from constraints"
                );
                done();
            });
        } catch (error) {
            assert.notOk(error);
            done();
        }
    });

    QUnit.test("getUserMedia facing user", assert => {
        const facingMode = { ideal: "user" };
        const configuration = {
            facingMode: facingMode
        };
        assert.timeout(10000);
        const done = assert.async();
        try {
            ARController.getUserMedia(configuration).then(video => {
                assert.ok(video, "The created video element");
                // Add the video element to html
                document.body.appendChild(video);
                window.video = video;
                const videoTrack = video.srcObject.getVideoTracks()[0];
                const videoTrackSettings = videoTrack.getSettings();

                const supported = navigator.mediaDevices.getSupportedConstraints();
                // Mobile supports facingMode to be set. Desktop states that facingMode is supported but doesn't list the facing mode inside the settings and hence it will fail
                if (supported["facingMode"] && videoTrackSettings.facingMode)
                    assert.deepEqual(
                        videoTrackSettings.facingMode,
                        facingMode.ideal,
                        "Video facing mode from constraints"
                    );
                done();
            });
        } catch (error) {
            assert.notOk(error);
            done();
        }
    });

    /* #### ARController.getUserMediaARController module #### */
    QUnit.module("ARController.getUserMediaARController", {
        beforeEach: assert => {
            window.timeout = 5000;
            window.cleanUpTimeout = 500;
        }
    });

    QUnit.test("getUserMediaARController default", assert => {
        const done = assert.async();
        assert.timeout(window.timeout);

        const config = {
            cameraParam: "./camera_para.dat", // URL to camera parameters definition file.
            maxARVideoSize: 640, // Maximum max(width, height) for the AR processing canvas.
            width: 640,
            height: 480,
            facingMode: "environment"
        };

        try {
            ARController.getUserMediaARController(config).then(arController => {
                assert.ok(arController, "ARController created");
                setTimeout(() => {
                    arController.dispose();
                    done();
                }, window.cleanUpTimeout);
            });
        } catch (error) {
            assert.notOk(error);
            done();
        }
    });
    QUnit.test("getUserMediaARController wrong calib-url", assert => {
        const done = assert.async();
        assert.timeout(5000);

        const error = error => { };

        const config = {
            cameraParam: "./camera_para_error.dat", // URL to camera parameters definition file.
            maxARVideoSize: 640, // Maximum max(width, height) for the AR processing canvas.
            width: 640,
            height: 480,
            facingMode: "environment"
        };
        try {
            ARController.getUserMediaARController(config).then(arController => {
                assert.ok(arController, "ARController created");
                try {
                    arController
                        .start()
                        .then(() => {
                            assert.ok(false);
                        })
                        .catch(error => {
                            assert.ok(error);
                            assert.notOk(arController.image);
                        })
                        .finally(() => {
                            done();
                        });
                } catch (error) {
                    assert.notOk(error);
                    done();
                }
            });
        } catch (error) {
            assert.notOk(error);
            done();
        }
    });
    QUnit.module("ARController.Test trackable registration", {
        afterEach: assert => {
            window.arController.dispose()
        }
    });
    QUnit.test("Register valid trackable", assert => {
        const done = assert.async();
        assert.timeout(5000);

        const config = {
            cameraParam: './camera_para.dat',
            maxARVideoSize: 640,
            width: 640,
            height: 480,
            facingMode: 'environment',
        };
        ARController.getUserMediaARController(config).then(arController => {
            var trackable = {
                trackableType: "single",
                url: './Data/hiro.patt'
            };
            window.arController = arController;
            arController.start().then(() => {
                arController.addTrackable(trackable).then(trackableId => {
                    assert.ok(trackableId >= 0);
                    done();
                }).catch(e => {
                    assert.notOk(e);
                    done();
                });
            }).catch(e => {
                assert.notOk(e);
                done();
            });
        }).catch(e => {
            assert.notOk(e);
            done();
        });

    });
    QUnit.test("Register invalid trackable", assert => {
        const done = assert.async();
        assert.timeout(5000);

        const config = {
            cameraParam: './camera_para.dat',
            maxARVideoSize: 640,
            width: 640,
            height: 480,
            facingMode: 'environment',
        };
        ARController.getUserMediaARController(config).then(arController => {
            const trackable = {
                trackableType: "single",
                url: './hiro_error.patt'
            };
            window.arController = arController;

            arController.addTrackable(trackable).then(trackableId => {
                assert.notOk(trackableId >= 0);
            }).catch(e => {
                assert.ok(e);
            }).finally(() => {
                done();
            });
        }).catch(e => {
            assert.notOk(e);
            done();
        });

    });
    QUnit.test("Register empty URL trackable", assert => {
        const done = assert.async();
        assert.timeout(5000);

        const config = {
            cameraParam: './camera_para.dat',
            maxARVideoSize: 640,
            width: 640,
            height: 480,
            facingMode: 'environment',
        };
        ARController.getUserMediaARController(config).then(arController => {
            const trackable = {
                trackableType: "single",
                url: ''
            };
            window.arController = arController;

            arController.addTrackable(trackable).then(trackableId => {
                assert.notOk(trackableId >= 0);
            }).catch(e => {
                assert.ok(e);
            }).finally(() => {
                done();
            });
        }).catch(e => {
            assert.notOk(e);
            done();
        });
    });

    // /* #### Full setup test #### */
    QUnit.module("Performance test", {
        beforeEach: assert => {
            window.timeout = 10000;
        }
    });
    QUnit.test("PTV: performance test video", assert => {

        const t0 = performance.now();
        const testDone = assert.async();

        performance.mark('start video measure');
        const done = () => {
            performance.mark('cleanup-done');
            performance.measure('Cleanup time', 'cleanup', 'cleanup-done');
            performance.measure('Test time', 'start video measure', 'cleanup-done');
            const measures = performance.getEntriesByType('measure');
            const csv = Papa.unparse(JSON.stringify(measures));
            console.log(csv);

            testDone();
        };
        assert.timeout(window.timeout);
        assert.expect(0);

        const config = {
            cameraParam: './camera_para.dat', // URL to camera parameters definition file.
            maxARVideoSize: 640, // Maximum max(width, height) for the AR processing canvas.
            width: 640,
            height: 480,
            facingMode: 'environment'
        }
        ARController.getUserMediaARController(config).then(arController => {
            window.arController = arController;
            document.body.appendChild(arController.image);

            performance.mark('getUserMediaARController-success');
            performance.measure('Start videostream', 'start video measure', 'getUserMediaARController-success');

            const trackable = {
                trackableType: 'single',
                url: './Data/hiro.patt'
            }
            arController.start().then(() => {
                arController.addTrackable(trackable).then((trackableId) => {
                    performance.mark('loadMarker-success');
                    performance.measure('Load marker', 'getUserMediaARController-success', 'loadMarker-success');
    
                    let t1 = performance.now();
                    //Process the open video stream
                    for (var i = 0; i <= 100; i++) {
                        performance.mark('process-' + i + ' start');
                        t1 = performance.now();
                        arController.process();
                        performance.mark('process-' + i + ' done');
                        performance.measure('process video', 'process-' + i + ' start', 'process-' + i + ' done');
                    }
    
                    performance.mark('cleanup');
                    arController.dispose();
                    done();
                }).catch(e => {
                    assert.notOk(e);
                    testDone();
                });
            }).catch(e => {
                asert.notOk(e);
                testDone(); 
            });

        }).catch(e => { assert.notOk(e); testDone(); });
    });
    QUnit.module("Performance test image",{
        beforeEach : assert => {
            window.timeout = 10000;
        }
    });
    QUnit.test("performance test image", assert => {
        const t0 = performance.now();
        const testDone = assert.async();
        const cParaUrl = './camera_para.dat';
        performance.mark('start image measure');
        const done = () => {
            performance.mark('cleanup-done');
            performance.measure('Cleanup time', 'cleanup', 'cleanup-done');
            performance.measure('Test time', 'start image measure', 'cleanup-done');
            const measures = performance.getEntriesByType('measure');
            const csv = Papa.unparse(JSON.stringify(measures));
            console.log(csv);

            testDone();
        };
        assert.timeout(window.timeout);
        assert.expect(0);

        const arController = new ARController(v1, cParaUrl);
        arController.start().then(() => {
            performance.mark('ARController.onload()');
            performance.measure('Start ARController','start image measure', 'ARController.onload()');

            const trackable = {
                trackableType: 'single',
                url: './Data/hiro.patt'
            }
            arController.addTrackable(trackable).then( trackableId => {
                performance.mark('loadMarker-success');
                performance.measure('Load marker','ARController.onload()', 'loadMarker-success');

                for(var i = 0; i <= 100; i++) {
                    //Process an image
                    performance.mark('process-' + i + ' start');
                    arController.process(v1);
                    performance.mark('process-' + i + ' done');
                    performance.measure('process image','process-' + i + ' start', 'process-' + i + ' done');
                }

                performance.mark('cleanup');
                arController.dispose();
                done();
            }).catch(e => {
                assert.notOk(e);
                testDone();
            });

        }).catch(e => {
            assert.notOk(e);
            testDone();
        });

    });
});
