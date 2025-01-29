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
