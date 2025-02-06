#!/bin/bash

START_DIR="$(pwd)"
ARCH=$(uname -m)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

rm -rf build/linux/installer
mkdir build/linux/installer

wails build -tags webkit2_41

eval $(jq -r '
  "export NAME=\"\(.name)\"\n" +
  "export VERSION=\"\(.info.productVersion)\"\n" +
  "export MAINTAINER=\"\(.author.name) <\(.author.email)>\"\n" +
  "export VENDOR=\"\(.info.companyName)\"\n" +
  "export DESCRIPTION=\"\(.info.comments)\"\n"
' wails.json)

cd build/linux

nfpm package -f ./nfpm.yaml -p rpm -t ./installer
nfpm package -f ./nfpm.yaml -p deb -t ./installer

cd flatpak
flatpak install flathub org.gnome.Platform//46 org.gnome.Sdk//46
flatpak-builder --force-clean --user --repo=repo builddir io.github.iptv_app.iptv_desktop.yaml
flatpak build-bundle repo ../installer/iptv-desktop_"$VERSION"_"$ARCH".flatpak io.github.iptv_app.iptv_desktop --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo

cd "$START_DIR" || exit 1
