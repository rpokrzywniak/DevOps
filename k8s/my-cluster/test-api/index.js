const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

console.log(keys);

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
    retry_strategy: () => 1000
});

pgClient.on('error', () => console.log('No connecion to PG DB'));
pgClient.query('CREATE TABLE IF NOT EXISTS results(number INT)').catch(err => console.log(err));

app.get('/:mass/:height', (req, resp) => {
    const mass = +req.params.mass;
    const height = +req.params.height;
    if(mass === 0 || height === 0){
        resp.send({result: "Wartość nie może być 0"});
        return;
    }
    const key = mass.toString()+'&'+height.toString();
    redisClient.get(key, (err, archivedNumber) => {
		if(!archivedNumber){
			archivedNumber = bmi(mass, height);
			redisClient.set(key, archivedNumber);			
        }
        pgClient.query('INSERT INTO results (number) VALUES (' + archivedNumber + ')').catch(err => console.log(err));
        resp.send({result: +archivedNumber});
    });
});

app.get('/', (req, resp) => {
        resp.send({result: keys.initMessage});
});

app.listen(5050, err => {
    console.log('Server! listening on port 5050');
});

function bmi(mass, height) {
    height = height / 100;
    height = Math.pow(height, 2);
    return (mass/height).toFixed(2);
}