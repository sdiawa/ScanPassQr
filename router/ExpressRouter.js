const {Bd} = require("../db/Config");
const express = require('express');
const app = express.Router();
app.get('/api/init', async function (req, res) {

    const user = await Bd.generate200Users().catch(() => {
        return res.status(304).send();
    });

    if (user === false)
        return res.status(409).send("error generating qr");
    return res.status(201).send("Success");
});
app.get('/', function (req, res) {
    res.send('<a href="/Api">API</a>')
});
app.get('/api', function (req, res) {
    res.send('<table> <thead><tr><th>Initialise</th><th>Check</th></tr></thead><tbody><tr><td><a href="/api/init">API Init</a></td><td><a href="/api/check">API Check QR</a></td></tr></tbody><</table>');
});
app.get('/api/check', async function (req, res) {
    if (req.query.qrHashCode) {
        const user = await Bd.checkValidQrHashCode(req.query.qrHashCode);
        if (user === null)
            return res.status(400).send();
        if (user)
            return res.status(200).send(
                {
                    is_valid: user.isValid,
                    last_check_date: user.lastCheckDate,
                });
        return res.status(409).send();

    } else
        return res.status(400).send();
});
module.exports = app;