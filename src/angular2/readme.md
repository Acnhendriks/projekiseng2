# Generic Baseline for Angular 2 (package.json as of 10 Oct 2016)

## Installation

1. Install NodeJS (https://nodejs.org/en/download/).
2. Open command prompt & change dir to this directory (`./src/angular2/`).
3. Run `npm install` from this directory.

## Update Angular 2 Dependencies to the latest version

1. Open directory (`./src/angular2/`), and delete node_modules.
2. Update all dependencies version in package.json to `("*")`. Ex: `"@angular/common": "^2.0.0"` --> `"@angular/common": "*"`
2. Open command prompt & change dir to this directory (`./src/angular2/`).
3. Run `npm update --save` and `npm update --save-dev` to update dependencies in package.json to the latest version.

## Base href in Index html for web and mobile apps

1. For development phase, both web and mobile apps use `(base href="/")`.
2. Production for web, use `(base href="/")`.
3. Production for mobile apps, use `(base href="./")`. 

## Cordova Project Installation

1. install ANDROID SDK & JDK
2. backup current config.xml and .gitignore from /cordova
		mkdir cordovabackup
		copy src/cordova/config.xml cordovabackup/config.xml
		copy src/cordova/.gitignore cordovabackup/.gitignore
3. `npm install -g cordova`
4. create cordova project on src folder
		cd src
		cordova create cordova id.co.astra.mobil88
	syntax details: `cordova create <folder_name> <domain> <app_name>`
3. add android platform on cordova folder
		cd cordova
		cordova platform add android --save
4. prepare cordova for build
		cordova prepare

### Build for Development

1. Open command prompt & change dir to this directory (`./src/angular2/`).
2. Run `npm start` to start webpack-dev-server (will be run in port 8080 - [can be configured in package.json]).
3. Open browser and type localhost:8080.

### Build for Cordova (Mobile)

*** Debugging in device *** 
1. Open command prompt & change dir to this directory (`./src/angular2/`).
2. Run `npm run cordova` to build cordova code, extracted code will be in `../cordova/www`.
4. Go to (`./src/cordova`) and run `cordova run (android/ios)`.
3. Open Chrome browser, type `chrome://inspect`.

*** APK Creation ***
1. To generate apk/ipa, go to (`./src/cordova`) and run `cordova build (android/ios)`.

### Build for Production (Web)

1. Open command prompt & change dir to this directory (`./src/angular2/`).
2. Run `npm run build` to build production code, extracted code will be in `../../dist`.
3. To test the code before deployment, go to directory `../../dist`.
4. Open command prompt & run `lite-server` in the `dist` directory.

