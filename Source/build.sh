#! /bin/bash

#
# Build artoolkitX for all platforms.
#
# Copyright 2018, artoolkitX Contributors.
# Author(s): Thorsten Bux <thor_artk@outlook.com> , Philip Lamb <phil@artoolkitx.org>
#

# Get our location.
OURDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARTOOLKITXJS_HOME=$OURDIR/..

# -e = exit on errors
set -e -x

# Parse parameters
while test $# -gt 0
do
    case "$1" in
        --debug) DEBUG=1
            ;;
        --dev) DEV=1
            ;;
        --*) echo "bad option $1"
            usage
            ;;
        *) echo "bad argument $1"
            usage
            ;;
    esac
    shift
done

# Locate ARTOOLKITX_HOME or clone into submodule
locate_artkX() {
    if [ ! -f "$OURDIR/Extras/artoolkitx/LICENSE.txt" ] && [ -z $ARTOOLKITX_HOME ]; then
        echo "artoolkitX not found. Please set ARTOOLKITX_HOME or clone submodule"

        read -p "Would you like to clone the submodule (recommended) y/n" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] ; then
            cd ..
            git submodule init
            git submodule update --remote
        else
            echo "Build failed!, Exit"
            exit 1;
        fi
    fi

    #Set ARTOOLKITX_HOME for internal use
    #Are we using the submodule?
    if [  -f "$OURDIR/Extras/artoolkitx/LICENSE.txt" ] && [ -z $ARTOOLKITX_HOME ]; then
        ARTOOLKITX_HOME=$OURDIR/Extras/artoolkitx
    fi
}

install_plugin() {
    VERSION=`cat ../version.txt`
    echo "Download lib"

    curl --location "https://github.com/augmentmy-world/artoolkitx/releases/download/$VERSION/artoolkitX.js.zip" -o plugin.zip
    unzip -o plugin.zip -d ../SDK/lib
    rm plugin.zip
}

#### If a DEV build is running the script uses the path to artoolkitX source to build artoolkitX plugin-libraries from there
#### If no dev build is running (default) the artoolkitX plugin-libraries are downloaded from GitHub release using the version provided

if [ $DEV ] ; then

        locate_artkX
        cd $ARTOOLKITX_HOME/Source

        if [ $DEBUG ] ; then
            ./build.sh emscripten --debug
        else
            ./build.sh emscripten
        fi

        cp $ARTOOLKITX_HOME/SDK/lib/artoolkitx.* $ARTOOLKITXJS_HOME/SDK/lib/
else
    echo "start download of libs"

    # ======================================================================
    #  Download lib artoolkitX.js
    # ======================================================================

    cd $OURDIR
    install_plugin
fi

# Also copy the artoolkitX.api.js into SDK/lib for now without minification
# TODO minify and optimize artoolkitX.api.js
cp $ARTOOLKITXJS_HOME/Source/artoolkitX.api.js $ARTOOLKITXJS_HOME/SDK/lib/
