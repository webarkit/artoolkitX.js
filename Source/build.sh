#!/bin/bash

#
# Build artoolkitX for all platforms.
#
# Copyright 2018, artoolkitX Contributors.
# Author(s): Thorsten Bux <thor_artk@outlook.com> , Philip Lamb <phil@artoolkitx.org>
#

usage() {
	cat<<-USAGE
	Usage: $0 [--dev [--debug]]
	    --dev	Build artoolkitx
	    --debug	Build artoolkitx with --debug
	USAGE
	exit 1
}

# Exit on errors
set -e

# Get our location
OURDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARTOOLKITXJS_HOME=$OURDIR/..

# Parse parameters
while test $# -gt 0
do
    case "$1" in
        --debug)
            DEBUG=1
            ;;
        --dev)
            DEV=1
            ;;
        --*)
            echo "Bad option: $1"
            usage
            ;;
        *)
            echo "Bad argument: $1"
            usage
            ;;
    esac
    shift
done

#### If a DEV build is running the script uses the path to artoolkitX source to build artoolkitX plugin-libraries from there
#### If no dev build is running (default) the artoolkitX plugin-libraries are downloaded from GitHub release using the version provided

if [ $DEV ]
then
    if [ -z $ARTOOLKITX_HOME ]
    then
        read -p "Would you like to init/update the submodule (recommended) y/n: " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            git submodule update --init --remote
        fi
        if [ -f "$OURDIR/extras/artoolkitx/LICENSE.txt" ]
        then
            ARTOOLKITX_HOME=$OURDIR/extras/artoolkitx
        else
            echo "artoolkitX not found. Please set ARTOOLKITX_HOME or use the submodule."
            echo "Build failed!"
            exit 1
        fi
    fi
    cd $ARTOOLKITX_HOME/Source
    if [ $DEBUG ]
    then
        ./build.sh emscripten --debug
    else
        ./build.sh emscripten
    fi
    cp $ARTOOLKITX_HOME/SDK/lib/artoolkitx.* $ARTOOLKITXJS_HOME/SDK/lib/
else
    # ======================================================================
    #  Download lib artoolkitX.js
    # ======================================================================
    echo "Downloading the artoolkitX plugin-libraries."
    VERSION=`cat ../version.txt`
    curl --location "https://github.com/augmentmy-world/artoolkitx/releases/download/$VERSION/artoolkitXjs.zip" -o $ARTOOLKITXJS_HOME/SDK/lib/plugin.zip
    unzip -o $ARTOOLKITXJS_HOME/SDK/lib/plugin.zip -d $ARTOOLKITXJS_HOME/SDK/lib
    rm $ARTOOLKITXJS_HOME/SDK/lib/plugin.zip
fi

# Also copy the artoolkitX.api.js into SDK/lib for now without minification
# TODO: Minify and optimize artoolkitX.api.js
cp $ARTOOLKITXJS_HOME/Source/artoolkitX.api.js $ARTOOLKITXJS_HOME/SDK/lib/

echo "Build complete."
