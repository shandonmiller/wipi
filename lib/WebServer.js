const WifiScanner = require('./WifiScanner');
const WifiManager = require('./WifiManager');
const express = require('express')
const app = express()
const wifiscn = new WifiScanner();
const wifimgr = new WifiManager();
const formidable = require('formidable');
const NodeRSA = require('node-rsa');
const compile = require('es6-template-strings/compile');
const resolveToString = require('es6-template-strings/resolve-to-string')
const fs = require('fs');

const key = new NodeRSA({ b: 1024 });
key.setOptions({ encryptionScheme: 'pkcs1' });

app.use(express.urlencoded({ extended: false }));

function ParseRequest(req) {
    let form = new formidable.IncomingForm();
    var properfields = {};

    form.on('field', function(name, value) {
        properfields[name] = value;
    });

    return new Promise(function(resolve, reject) {
        form.parse(req, async function(err, fields, files) {
            if (err) return reject(err);
            return resolve(properfields);
        });
    });
}

app.get('/images/excellent.jpg', function(req, res) {
    res.sendFile(__dirname + '/content/excellent.jpg');
});

app.get('/images/good.jpg', function(req, res) {
    res.sendFile(__dirname + '/content/good.jpg');
});

app.get('/images/fair.jpg', function(req, res) {
    res.sendFile(__dirname + '/content/fair.jpg');
});

app.get('/images/poor.jpg', function(req, res) {
    res.sendFile(__dirname + '/content/poor.jpg');
});

app.get('/images/lock.png', function(req, res) {
    res.sendFile(__dirname + '/content/lock.png');
});

app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + '/content/style.css');
});

app.get('/jsencrypt.js', function(req, res) {
    res.sendFile(__dirname + '/content/jsencrypt.js');
});

app.get('/publickey', function(req, res) {
    var publicDer = key.exportKey('public');
    res.status(200).send(publicDer);
});

app.post('/set', async function(req, res) {
    let fields = await ParseRequest(req);
    const ssid = fields.ssid;
    const password = key.decrypt(fields.password, 'utf8');
    
    wifimgr.EnableWifi(ssid, password);
    res.status(200).send('Connected');
});

app.get('/', function(req, res) {
    let networks = wifiscn.Scan();
    let rows = '';
    networks.forEach(n => {
        let signal = parseInt(n.signal);
        let image = '/images/poor.jpg';
        
        if (signal > -50) image = '/images/excellent.jpg';
        if (signal <= -50 && signal > -60) image = '/images/good.jpg';
        if (signal <= -60 && signal > -70) image = '/images/fair.jpg';

        let type = n.type === 'secure' ?  '<img width="50" src="/images/lock.png">' : '';

        if (n.ssid.trim() != '') {
            rows += `<tr onClick="prompt('${n.ssid}')"><td height="150"><font size="+8" face="verdana">${n.ssid}</font></td><td>${type}</td><td><img width="50" src="${image}"></td></tr>`
        }
    });

    let index = fs.readFileSync(__dirname + '/content/index.html', 'UTF-8');
    let compiled = compile(index);
    let body = resolveToString(compiled, { rows });
    res.status(200).send(body);
});

app.listen(80);