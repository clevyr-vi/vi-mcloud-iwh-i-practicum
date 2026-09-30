require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const OBJECT_TYPE_ID = process.env.OBJECT_TYPE_ID;

if (!PRIVATE_APP_ACCESS || !OBJECT_TYPE_ID) {
    console.error('[Error] Missing PRIVATE_APP_ACCESS or OBJECT_TYPE_ID in .env');
    process.exit(1);
}

const toMultiCheckbox = (value) => [].concat(value || []).join(';');

// * Homepage
app.get('/', async (req, res) => {
    const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE_ID}?properties=name,life_cycle,season,pollinators&limit=100`;
    const headers = { Authorization: `Bearer ${PRIVATE_APP_ACCESS}` };
    try {
        const resp = await axios.get(url, { headers });
        res.render('homepage', { title: 'Flower Seeds | Pollin8r', seeds: resp.data.results });
    } catch (error) {
        res.status(500).send('Could not load seeds.');
        console.error(error.response?.data || error.message);
    }
});

// * Create/Edit Form - GET
app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// * Create/Edit Form - POST
app.post('/update-cobj', async (req, res) => {
    const body = {
        properties: {
            name: req.body.name,
            life_cycle: req.body.life_cycle,
            season: req.body.season,
            pollinators: toMultiCheckbox(req.body.pollinators),
        },
    };
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json',
    };
    try {
        await axios.post(`https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE_ID}`, body, { headers });
        res.redirect('/');
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Could not save! Check the server log.');
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
