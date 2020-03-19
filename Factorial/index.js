const express = require('express');
const redis = require('redis');
 
const app = express();
const process = require('process');
 
const client = redis.createClient({
    host: 'redis-server',
    port: 6379
});
 
app.get("/:number", (req, resp) => {
	const number  = +req.params.number;
	if(number > 10){
		process.exit(0);
	}
    client.get(number, (err, archivedNumber) => {
		if(!archivedNumber){
			archivedNumber = rFact(number);
			client.set(number, archivedNumber);			
		}
        resp.send("silnia z " + number + " to: " + archivedNumber);
    })
});
 
app.listen(8080, () => {
    console.log("Server listening on port 8080");
});

function rFact(num){
    if (num === 0){
		  return 1; 
	}
    else{
		  return num * rFact( num - 1 );
	}
}