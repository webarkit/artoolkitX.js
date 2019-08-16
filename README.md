# ARToolkitX.js
Emscripten port of ARToolKitX to JavaScript.

## Requirements
- Emscripten installed, go to this page for instructions: https://emscripten.org/docs/getting_started/downloads.html
- Cmake
- OpenCV if you want the 2d tracking feature.
- OpenGL

## Build instructions

First open a terminal console and clone this repository:

```shell
git clone https://github.com/augmentmy-world/artoolkitX.js.git
```

then in the terminal console, enter into the Source folder:

```shell
cd artoolkitX.js/Source
```

run this command:

```shell
./build.sh --dev
```
 The build process should start, after some checks you will asked if you want to clone the [ArtoolkitX](https://github.com/artoolkitx/artoolkitx) project inside ARtoolkitX.js:

 ```shell
Would you like to clone the submodule (recommended) y/n
```

Choose **y**(yes) if you want to clone and save it inside The `Source/extra` folder or you can choose **n**(no) if you have already it in another location. In this case you must set up the **ARTOOLKITX_HOME** env variable.

As Cmake will finish the configure process and generate the makefiles, the real build process will begin and in few minutes the `artoolkitx.js` lib will be ready.

## Examples
Go into the Examples folder, start a http server and test them. For now try:

- test.html
- simple_image.html
- simple_video.html
- simple_video_hiro.html

## Author
**Thorsten Bux** https://github.com/ThorstenBux
Collaborator: **Walter Perdan** https://github.com/kalwalt

## OS tested
Tested under Ubuntu 18.04 and macOS.
