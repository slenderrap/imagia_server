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
app.post('/api/usuaris/registrar', async (req, res) => {
    try {
        const {telefon, nickname, email, contrasenya} = req.body;
        
        if (!telefon || !nickname || !email || !contrasenya) {
            return res.status(400).send(createResponse("ERROR", "All fields are required"));
        }

        await createUser(nickname, email, contrasenya, telefon, nickname, null, null);
        res.send(createResponse("OK", "User registered successfully", {"name": nickname, "email": email}));
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Registration error: ${error.message}`));
    }
});

//Endpoint for login
app.post('/api/admin/usuaris/login', [authMiddleware], async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).send(createResponse("ERROR", "Username and password must be provided"));
        }
        const token = await verifyUserAndPassword(username, password);
        if (token) {
            return res.send(createResponse("OK", "Login successful", { token }));
        } else {
            return res.status(401).send(createResponse("ERROR", "Invalid username or password"));
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Login error: ${error.message}`));
    }
});

// Endpoint to validate a user
app.post('/api/usuaris/validar', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).send(createResponse("ERROR", "Username is required"));
        }
        const smsCode = Math.floor(100000 + Math.random() * 900000);
        await addSmsToUser(username, smsCode);
        const phoneNumber = await getUserPhone(username);
        const message = `Enter+this+code+to+validate+your+account:+${smsCode}`;
        await sendSms(message, phoneNumber);
        res.send(createResponse("OK", "Validation SMS sent successfully"));
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Validation error: ${error.message}`));
    }
});

//validar sms
app.post('/api/usuaris/sms', async (req, res) => {
    try {
        const { username, sms } = req.body;
        if (!username || !sms) {
            return res.status(400).send(createResponse("ERROR", "Username and SMS code are required"));
        }
        const isValidSms = await verifySmsFromUser(username, sms);
                if (!isValidSms) {
            return res.status(400).send(createResponse("ERROR", "Invalid SMS code"));
        }
        const token = Math.floor(1000000000 + Math.random() * 9000000000);
        await addTokenToUser(username, token);
        await activateUser(username);
        res.send(createResponse("OK", "User validated successfully", { token }));
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Validation error: ${error.message}`));
    }
});

//Endpoint  to get user's profile
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



//Endpoint to update acount type: Admin, Premium,, Free
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

        await changeUserRole(username, plan);
        res.send(createResponse("OK", "User plan updated successfully", { username, plan }));
    } catch (error) {
        console.error(error);
        res.status(500).send(createResponse("ERROR", `Error updating user plan: ${error.message}`));
    }
});

//Endpoint to list users
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
