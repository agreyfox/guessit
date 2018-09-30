var guessit = require('./guessit');

var filter = guessit.chain3.mc.filter('latest');
filter.watch(function(error, result) {
    var receipt = guessit.chain3.mc.getTransaction(hash);
    if (!error && receipt && receipt.blockNumber != null) {
    console.log("done.");
    filter.stopWatching();
    process.exit(0);
    }
}); 