const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort
});

console.log(keys);

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('No connecion to PG DB'));
pgClient.query('CREATE TABLE IF NOT EXISTS results(number INT)').catch(err => console.log(err));

app.get('/:number1/:number2', (req, resp) => {
    const number1 = +req.params.number1;
    const number2 = +req.params.number2;
    const key = number1.toString()+'&'+number2.toString();
    redisClient.get(key, (err, archivedNumber) => {
		if(!archivedNumber){
			archivedNumber = gcd(number1, number2);
			redisClient.set(key, archivedNumber);			
        }
        pgClient.query('INSERT INTO results (number) VALUES (' + archivedNumber + ')').catch(err => console.log(err));
        resp.send("NWD z " + number1 + " i " + number2 + " to: " + archivedNumber);
    });
});

app.listen(8080, err => {
    console.log('Server! listening on port 8080');
});

function gcd(a,b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {var temp = a; a = b; b = temp;}
    while (true) {
        if (b == 0) return a;
        a %= b;
        if (a == 0) return b;
        b %= a;
    }
}