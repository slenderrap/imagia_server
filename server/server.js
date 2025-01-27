const express = require('express');
const authMiddleware = require('./middleware.js');
const {createResponse} = require('./utils.js');
const {sequelize} = require('./database/index.js');
const { createUser } = require('./database/QueryLib.js');

const hostname = '0.0.0.0';
const port = 3000;
const app = express();

app.use(express.json({limit: '50mb'}));

// Endpoint to register a user
app.post('/api/usuaris/registrar', (req, res) => {
    const {telefon, nickname, email, contrasenya} = req.body;
    createUser( nickname, email, contrasenya, telefon, nickname, null);
    res.send(createResponse("OK", "Usuari registrat correctament", {"nom": nickname, "email": email}));
});

// Endpoint to validate a user
app.post('/api/usuaris/validar', (req, res) => {
    const {telefon, codi_validacio} = req.body;
    // TODO: Implementar la lògica per validar un usuari
    throw new Error("Not implemented yet");
    generatedApiKey = "1234567890"; // TODO: Generar una clau API vàlida
    res.send(createResponse("OK", "Usuari validat correctament", {"api_key": generatedApiKey}));
});

app.get('/api/usuaris/perfil', [authMiddleware], (req, res) => {
    // TODO: Implementar la lògica per obtenir el perfil de l'usuari
    
});

// Endpoint to analyze an image
app.post('/api/analitzar-imatge', [authMiddleware], async (req, res) => {

    const {prompt, stream, images} = req.body;

    const body = {
        "model": "llama3.2-vision",
        "prompt": prompt,
        "stream": stream,
        "images": images
    }

    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    if(response.ok) {
        const data = await response.json();
        res.send(createResponse("OK", "Maria image processed", data["response"]));
    }else{
        console.log(response.statusText);
        res.send(createResponse("ERROR", "Error processing image"));
    }
});

(async () => {
    try {
      await sequelize.sync({ alter: true });
      console.log('Base de datos sincronizada.');
  
      app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  })();