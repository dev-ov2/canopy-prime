# Canopy Prime

A standalone executable that detects games and donates on your behalf while games are running. Auto detection built-in, Steam support out the gate.

Built on the [Electron React App](https://github.com/guasam/electron-react-app) framework. Credits to the contributors!

## Installation

Download the latest exe from the [Releases](https://github.com/dev-ov2/canopy-prime/releases) page.

The app auto-updates. One install from here is all you need.

<br />

## Development

In contrast to the [Electron React App's Readme](https://github.com/guasam/electron-react-app), we use `pnpm` for package management.

To get started with development:

```bash
# Clone the repository
git clone https://github.com/dev-ov2/canopy-prime

# Change directory
cd canopy-prime

# Install dependencies (explicitly using pnpm)
pnpm install

# start the dev build
pnpm run dev
```

Similar to [Electron React App](https://github.com/guasam/electron-react-app), this will start Electron with hot-reload enabled so you can see changes in real time.

I highly recommend reading their Readme, as there is a lot of good info about how the inner workings are set up here. If you're wondering why it's religiously highlighted here, that's why.

## Building for Production

Build the application for your platform:

```bash
# For Windows
npm run build:win
```

Linux and MacOS will be supported at a later date.

Distribution files will be located in the `dist` directory.
