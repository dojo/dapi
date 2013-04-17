var fs = require('fs');
/*
*   In progress, may be needed for different environments
*
*/
var data = fs.readFileSync(process.cwd() + '/config.json'), configObj;
try {
    configObj = JSON.parse(data);
    console.dir(configObj);
}
catch (err) {
    console.log('There has been an error parsing your JSON.');
    console.log(err);
    process.exit(1);
}
exports.appConfig = configObj;