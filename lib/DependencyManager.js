const shell = require('shelljs');

module.exports = class DependencyManager{
	constructor(){

	}

	InstallMissing(){
		//this._run('sudo apt-get update -y');

		if(this._checkExists('dnsmasq')){
			this._run('sudo apt-get install dnsmasq -y');
		}

		if(this._checkExists('hostapd')){
			this._run('sudo apt-get install hostapd -y');
		}

		if(this._checkExists('iw')){
			this._run('sudo apt-get install iw -y');
		}
	}

	_checkExists(name){
		let { stdout, stderr, code } = shell.exec(`which ${name}`, { silent: true });
		
		if(stderr){
			console.log(`Unable to check for dependency "${name}": ${stderr}`);
			throw new Error(`Unable to check for dependency "${name}": ${stderr}`);
		}

		if (stdout == "") {
			console.log(`Missing dependency "${name}"`);
			return false;
		}else{
			return true;
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
}