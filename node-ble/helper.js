// Constructor
function Helper() {
    this.crypto = require('crypto');
    this.privateKey = 'wE4kDFMW6vsXUkv6Epmu';
    this.cipher = this.crypto.createCipher('aes192', this.privateKey);
    this.decipher = this.crypto.createDecipher('aes192', this.privateKey);
}
// class methods
Helper.prototype.Encrypt = function(value) {
    this.cipher = this.crypto.createCipher('aes192', this.privateKey);
    var result = '';

    this.cipher.on('readable', () => {
            var data = this.cipher.read();
        if (data)
            result += data.toString('hex');
    });
    this.cipher.write(value, result);
    this.cipher.end();
    return result;
};

Helper.prototype.Decrypt = function(value) {
    this.decipher = this.crypto.createDecipher('aes192', this.privateKey);
    var result = '';

    this.decipher.on('readable', () => {
        var data = this.decipher.read();
    if (data)
        result += data.toString('utf8');
    });

    this.decipher.write(value, 'hex');
    this.decipher.end();
    return result;
};

Helper.prototype.Write = function(data) {
    var fs = require('fs');
    fs.appendFile("logs.txt", data+"\n", function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
};

Helper.prototype.DataExistsInFile = function(value) {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('logs.txt')
    });

    lineReader.on('line', function (line) {
        console.log('Line from file:', line);
        if(line.indexOf(value) !== -1) return true;
    });
};

Helper.prototype.BlinkLED = function () {
    var child_process = require('child_process');
    child_process.execFile('sudo', ['./GPIOBoard/board'], (err, stdout, stderr) => {
        if (err) throw err;
        console.log(stdout, stderr);
    });
};

// export the class
module.exports = Helper;