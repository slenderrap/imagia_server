const express = require('express');
const authMiddleware = require('./middleware.js');
const {createResponse} = require('./utils.js');
const {sequelize} = require('./database/index.js');
const { createUser } = require('./database/QueryLib.js');
const path = require('path');

const hostname = '0.0.0.0';
const port = 3000;
const app = express();

app.use(express.json({limit: '500mb'}));

app.use(express.static('public'));

app.get('/api/api-docs', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'api-docs.html'));
});

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
    res.send("Not implemented yet");
});

// Endpoint to analyze an image
app.post('/api/analitzar-imatge', [authMiddleware], async (req, res) => {

    console.log("Analitzant imatge...");
    const {prompt, stream, images} = req.body;
    console.log("Prompt: ", prompt);
    console.log("Stream: ", stream);
    console.log("Images: ", images);
    if (!prompt || !Array.isArray(images) || images.length === 0) {
        return res.status(400).send(createResponse("ERROR", "Invalid input data"));
    }

    const body = {
        "model": "llama3.2-vision",
        "prompt": prompt,
        "stream": stream,
        "images": images
    }

    const response = await fetch('http://192.168.1.14:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    if(response.ok) {
        const data = await response.json();
        res.send(createResponse("OK", "Maria image processed", data["response"]));
    }else{
        console.log(response.statusText);
        res.send(createResponse(`ERROR ${response.status}`, "Error processing image",response.json()));
    }
});

app.get("/api", (req, res) => {
    res.send(createResponse("OK", "API working correctly"));
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




app.post('/api/admin/usuaris/pla/actualitzar', [authMiddleware], async (req, res) => {
    try {
        const { token, username, plan } = req.body;
        if (!token || !username || !plan) {
            return res.status(400).send(createResponse("ERROR", "Token, username, and plan must be provided"));
        }
        const isAdmin = await verifyAdminToken(token);
        if (!isAdmin) {
            return res.status(403).send(createResponse("ERROR", "Token does not belong to an admin"));
        }
        const user = await User.findOne({ where: { username }, raw: true });
        if (!user) {
            return res.status(404).send(createResponse("ERROR", "User not found"));
        }
        const validRoles = ['free', 'premium', 'admin'];
        if (!validRoles.includes(plan)) {
            return res.status(400).send(createResponse("ERROR", "Invalid role provided"));
        }

        await changeUserRole(user.id, plan);
        res.send(createResponse("OK", "User plan updated successfully", { username, plan }));
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Error updating user plan: ${error.message}`));
    }
});

app.get('/api/admin/usuaris', [authMiddleware], async (req, res) => {
    try {
        const users = await getAllUsers();
        res.send(createResponse("OK", "Users fetched successfully", users));
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Error fetching users: ${error.message}`));
    }
});

//todo
app.get('/api/usuaris/quota', [authMiddleware], (req, res) => {});
app.get('/api/admin/usuaris/quota', [authMiddleware], (req, res) => {});
app.post('/api/admin/usuaris/quota/actualitzar', [authMiddleware], (req, res) => {});
app.post('/api/usuaris/validar', (req, res) => {});
app.get('/api/usuaris/perfil', [authMiddleware], (req, res) => {});
