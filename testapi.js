let PremiumizeMe = require('./api/helper/premiumizeme').PremiumizeMe;
let configuration = require('./api/helper/premiumizeme.json');
let premiumize = new PremiumizeMe(configuration);

premiumize.listDirectory(null, function(response) {

    console.log(JSON.stringify(response));
});

