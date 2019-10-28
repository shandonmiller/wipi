const DependencyManager = require('./lib/DependencyManager');
const WifiManager = require('./lib/WifiManager');
const WifiScanner = require('./lib/WifiScanner');

const dep = new DependencyManager();
const wifimgr = new WifiManager();
const wifiscn = new WifiScanner();

dep.InstallMissing();
const mode = wifimgr.Mode();

console.log('Current Mode: ', mode);

if(mode == 'ACCESS_POINT'){
	require("./lib/WebServer");
}

if(mode == 'NOT_CONNECTED'){
	wifimgr.EnableAccessPoint();
	require("./lib/WebServer");
}