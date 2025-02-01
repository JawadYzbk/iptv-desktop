# IPTV Desktop

<p align="center">
<img src="./build/appicon.png" width="150px">
</p>

IPTV Desktop is application for playing IPTV from [iptv-org](https://github.com/iptv-org/iptv) playlist. Support listing channel from [iptv-org api](https://github.com/iptv-org/api) by Country, Category, and Language.

## Preview

### Channel List Screen:

![Channel List Preview of Application](./preview-list.png)

### Watch Screen:

![Watch Screen Preview of Application](./preview-watch.png)

## Features

- List Channels By Country, Category, and Language.
- Caching stream and channel data.
- Use Custom DNS Over HTTPS Server.
- Caption / Subtitle Support.
- Local Playlist

## Installation

Currently we only provide binary for Linux and Windows in our [release page](https://github.com/iptv-app/iptv-desktop/releases).

## Development

This application is build with go, [wails](https://wails.io/), react, tailwind css, shadcn, video.js. You can developing or building application locally by cloning this repository and installing package dependency using bun.

## Disclaimer

This repository doesn't store any video, playlist, or streaming url. This repository use [public api from iptv-org](https://github.com/iptv-org/iptv).
