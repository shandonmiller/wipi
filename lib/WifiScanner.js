const shell = require('shelljs');

module.exports = class WifiScanner{
	constructor(){

	}

	Scan(){
		let raw = this._scan();
		let parsed = this._parse(raw);
		let unique = this._unique(parsed);
		return unique;
	}

	_parse(output){
		let lines = output.split('\n');
		let result = [];
		let currentNetwork = null;

		lines.forEach(line => {
			let ssid = line.match(/ESSID:\"(.*)\"/);
			let quality = line.match(/Quality=(\d+)/);
			let signal = line.match(/level=(\d+)/);
			let secure = line.match(/Encryption key:(on)/);
			let open = line.match(/Encryption key:(off)/);

			if(ssid){
				if(currentNetwork != null) result.push(currentNetwork);
				currentNetwork = {ssid: ssid[1]}
			}

			if(quality && currentNetwork) currentNetwork.quality = quality[1];
			if(signal && currentNetwork) currentNetwork.signal = signal[1];
			if(secure && currentNetwork) currentNetwork.type = 'secure';
			if(open && currentNetwork) currentNetwork.type = 'open';
		});

		result.push(currentNetwork);
		return result;
	}

	_unique(networks){
		let uniqueNewtorks = {};

		networks.forEach(n => {
			if(uniqueNewtorks[n.ssid]){
				if(uniqueNewtorks[n.ssid].quality < n.quality){
					uniqueNewtorks[n.ssid] = n;
				}
			}else{
				uniqueNewtorks[n.ssid] = n;
			}
		});

		let result = [];
		for(let key in uniqueNewtorks){
			result.push(uniqueNewtorks[key]);
		}

		return result;
	}

	_scan(){
		let { stdout, stderr, code } = shell.exec(`sudo iwlist scan`, { silent: true });

		if(stderr){
			console.log(`Unable to scan for wifi networks: ${stderr}`);
		//	throw new Error(`Unable to scan for wifi networks: ${stderr}`);
		}

		return stdout;
	}
}