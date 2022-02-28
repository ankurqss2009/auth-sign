//import 'dotenv/config';

const express = require('express')
const app = express()
const Web3 = require('web3');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3000

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Custom Middleware
app.use((req, res, next) => {
    let validIps = ['::12', '::1', '::ffff:127.0.0.1']; // Put your IP whitelist in this array

    console.log("req.socket.remoteAddress",req.socket.remoteAddress)
    if(!process.env.whitelistIp || validIps.includes(req.socket.remoteAddress)){
        // IP is ok, so go on
        console.log("IP ok");
        next();
    }
    else{
        // Invalid ip
        console.log("Bad IP: " + req.socket.remoteAddress);
        const err = new Error("Bad IP: " + req.socket.remoteAddress);
        next(err);
    }
})

// Error handler
app.use((err, req, res, next) => {
    console.log('Error handler', err);
    res.status(err.status || 500);
    res.send("Something broke");
});

app.get('/', (req, res) => {
    res.send('Hello World, from express on key '+ process.env.privateKey);
});

app.post('/api/signature/:apiKey', function (req, res) {
    if(req.params.apiKey !== process.env.secretKey){
        return res.send("invalid api key");
    }
    let address = req.body.address;
    let amount = req.body.amount;
    let exteration = req.body.exteration;

    const message = Web3.utils.soliditySha3(
        {t: 'address', v: address},
        {t: 'uint256', v: amount.toString()},
        {t: 'uint256',  v: exteration.toString()}
    ).toString('hex');
    const web3 = new Web3('');

    console.log("message",message);
    const { signature } = web3.eth.accounts.sign(
        message,
        process.env.privateKey
    );
    return res.send(signature);
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));