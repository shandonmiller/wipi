const DependencyManager = require('./lib/DependencyManager');
const WifiManager = require('./lib/WifiManager');
const WifiScanner = require('./lib/WifiScanner');

const dep = new DependencyManager();
const wifimgr = new WifiManager();
const wifiscn = new WifiScanner();

if(wifimgr.Mode() == 'ACCESS_POINT'){
	require("./lib/WebServer");
}

if(wifimgr.Mode() == 'NOT_CONNECTED'){
	wifimgr.EnableAccessPoint();
	require("./lib/WebServer");
}
