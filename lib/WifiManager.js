const shell = require('shelljs');
const fs = require('fs');

module.exports = class WifiManager{
	constructor(){

	}

	Mode(){
		let ssid = this._currentssid();
		console.log(ssid)
		if(ssid === 'wipi'){
			return 'ACCESS_POINT'
		}
		if(ssid === 'off/any' || !ssid){
			return 'NOT_CONNECTED';
		}
		return 'WIFI_CONNECTED';
	}

	EnableAccessPoint(){
		this._copyFile('./templates/dhcpcd/dhcpcd.ap.template', '/etc/dhcpcd.conf');
		this._copyFile('./templates/dnsmasq/dnsmasq.ap.template', '/etc/dnsmasq.conf');
		this._copyFile('./templates/hostapd/hostapd.ap.template', '/etc/hostapd/hostapd.conf');
		this._copyFile('./templates/default/hostapd.ap.template', '/etc/default/hostapd');
		this._copyFile('./templates/hosts/hosts.ap.template', '/etc/hosts');
		
		this._run('iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.1:80');
		this._run('sudo systemctl restart dhcpcd');
		this._run('sudo ifconfig wlan0 down');
		this._run('sudo ifconfig wlan0 up');
		this._run('sudo systemctl restart hostapd');
		this._run('sudo systemctl restart dnsmasq');
	}

	EnableWifi(ssid, password){
		this._copyFile('./templates/wpa_supplicant/wpa_supplicant.conf.template', '/etc/wpa_supplicant/wpa_supplicant.conf');
		this._copyFile('./templates/dhcpcd/dhcpcd.station.template', '/etc/dhcpcd.conf');
		this._copyFile('./templates/dnsmasq/dnsmasq.station.template', '/etc/dnsmasq.conf');
		this._copyFile('./templates/hostapd/hostapd.station.template', '/etc/hostapd/hostapd.conf');
		this._copyFile('./templates/default/hostapd.station.template', '/etc/default/hostapd');

		this._run('iptables -t nat -D PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.1:80');
		this._run('sudo systemctl stop dnsmasq');
		this._run('sudo systemctl stop hostapd');
		this._run('sudo systemctl restart dhcpcd');
		this._run('sudo ifconfig wlan0 down');
		this._run('sudo ifconfig wlan0 up');
	}

	_currentssid(){
		let network = this._run('iwconfig wlan0');
		let lines = network.split('\n');
		for(let i = 0; i < lines.length; i++){
			let ssid = lines[i].match(/ESSID:(.*)/);
			if(ssid) return ssid[1].trim();
		}
	}

	_run(cmd){
		let { stdout, stderr, code } = shell.exec(`${cmd}`, { silent: true });
		if(stderr){
			console.log(`Unable to run command "${cmd}": ${stderr}`);
			throw new Error(`Unable to run command "${cmd}": ${stderr}`)
		}
		return stdout;
	}

	_copyFile(sourceFilePath, destinationFilePath){
		let source = fs.readFileSync(sourceFilePath, 'UTF8');
		fs.writeFileSync(destinationFilePath, source);
	}
}