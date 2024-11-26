require('dotenv').config();
const https = require('https');
const express = require('express');
const app = express();
const port = 3000;

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

app.use(express.static('public'));

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_API_KEY });

app.get('/api/recommendations', (req, res) => {
    const city = req.query.city || 'Barcelona, España';
    console.log('Ciudad recibida:', city);

    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;

    // Solicitud de clima
    fetchData(weatherApiUrl)
    .then(weatherData => {
        // Búsqueda de lugares turísticos
        return geocodingClient.forwardGeocode({
            query: `tourist attractions in ${city}`,
            limit: 5,
            types: ['poi', 'landmark', 'place']
        }).send().then(response => {
            return { weatherData, mapboxData: response.body };
        });
    })
    .then(({ weatherData, mapboxData }) => {
        const places = mapboxData.features.map(feature => ({
            name: feature.place_name,
            coordinates: feature.geometry.coordinates
        }));

        const response = {
            city,
            weather: {
                description: weatherData.weather[0].description,
                temperature: weatherData.main.temp
            },
            places: places.length > 0 ? places : [
                { name: 'No se encontraron lugares turísticos', coordinates: [0, 0] }
            ]
        };

        res.json(response);
    })
    .catch(error => {
        // Cambio aquí: loguear el error completo y enviarlo
        console.error('Error COMPLETO:', error);
        res.status(500).json({
            error: 'Error al obtener datos',
            detailedError: error.toString()
        });
    });
});

// Función para hacer solicitudes a las APIs
function fetchData(apiUrl) {
    return new Promise((resolve, reject) => {
        https.get(apiUrl, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
