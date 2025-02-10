const express = require('express');
const authMiddleware = require('./middleware.js');
const {createResponse} = require('./utils.js');
const {sequelize} = require('./database/index.js');
const {sendSms} = require('./utils.js');
const { createUser, verifyUserAndPassword, verifyAdminToken, getUserCustom, changeUserRole, addSmsToUser, getUserPhone, verifySmsFromUser, isValidSms, getUserRequests, addTokenToUser, activateUser, getUserIdFromToken, getUserRole, getUsernameById, countUserRequests, createRequest, getAllUsers, getLogs, createLog, getLastHourLogs } = require('./database/QueryLib.js');
const path = require('path');
require('dotenv').config();
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
        const {username, telefon, nickname, email, contrasenya} = req.body;
        
        if (!username || !telefon || !nickname || !email || !contrasenya) {
            await createLog("Error", username, "Missing required fields");
            return res.status(400).send(createResponse("ERROR", "All fields are required"));
        }

        await createUser(username, email, contrasenya, telefon, nickname, null, null);
        await createLog("Creació d'usuari", username, "User registered successfully");
        res.send(createResponse("OK", "User registered successfully", {"name": nickname, "email": email}));
    } catch (error) {
        console.error(error);
        await createLog("Error", "Unknown", `Registration error: ${error.message}`);
        res.status(500).send(createResponse("ERROR", `Registration error: ${error.message}`));
    }
});

//Endpoint for login
app.post('/api/admin/usuaris/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            await createLog("Error", username, "Username and password must be provided");
            return res.status(400).send(createResponse("ERROR", "Username and password must be provided"));
        }
        const token = await verifyUserAndPassword(username, password);
        if (!token) {
            await createLog("Error", username, "Invalid username or password");
            return res.status(401).send(createResponse("ERROR", "Invalid username or password"));
        }
        const isAdmin = await verifyAdminToken(token);
        if (!isAdmin) {
            await createLog("Error", username, "User is not an admin");
            return res.status(403).send(createResponse("ERROR", "User is not an admin"));
        }
        await createLog("Inici de sesió", username, "User Admin login successful");
        return res.send(createResponse("OK", "Admin login successful", { token }));
    } catch (error) {
        console.error(error);
        await createLog("Error", "Unknown", `Login error: ${error.message}`);
        res.status(500).send(createResponse("ERROR", `Login error: ${error.message}`));
    }
});

// Endpoint to validate a user
app.post('/api/usuaris/validar', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            await createLog("Error", "Unknown", "Username is required");
            return res.status(400).send(createResponse("ERROR", "Username is required"));
        }
        const smsCode = Math.floor(100000 + Math.random() * 900000);
        await addSmsToUser(username, smsCode);
        const phoneNumber = await getUserPhone(username);
        const message = `Enter+this+code+to+validate+your+account:+${smsCode}`;
        await sendSms(message, phoneNumber);
        await createLog("Validació", username, "Validation SMS sent successfully");
        res.send(createResponse("OK", "Validation SMS sent successfully"));
    } catch (error) {
        console.error(error);
        await createLog("Error", "Unknown", `Validation error: ${error.message}`);
        res.status(500).send(createResponse("ERROR", `Validation error: ${error.message}`));
    }
});

//validar sms
app.post('/api/usuaris/sms', async (req, res) => {
    try {
        const { username, sms } = req.body;
        if (!username || !sms) {
            await createLog("Error", username, "Username and SMS code are required");
            return res.status(400).send(createResponse("ERROR", "Username and SMS code are required"));
        }
        const isValidSms = await verifySmsFromUser(username, sms);
                if (!isValidSms) {
                    await createLog("Error", username, "Invalid SMS code");
                    return res.status(400).send(createResponse("ERROR", "Invalid SMS code"));
        }
        const token = Math.floor(1000000000 + Math.random() * 9000000000);
        await addTokenToUser(username, token);
        await activateUser(username);
        await createLog("Validació", username, "User validated successfully");
        res.send(createResponse("OK", "User validated successfully", token ));
    } catch (error) {
        console.error(error);
        await createLog("Error", "Unknown", `Validation error: ${error.message}`);
        res.status(500).send(createResponse("ERROR", `Validation error: ${error.message}`));
    }
});

//Endpoint  to get user's historic
app.get('/api/usuaris/historial', [authMiddleware], async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userId = await getUserIdFromToken(token);
        const username = await getUsernameById(userId);
        const historic = await getUserRequests(userId);
        await createLog("Historial", username, "Historic fetched successfully");
        res.send(createResponse("OK", "Historic fetched successfully", historic));
    } catch (error) {
        console.error(error);
        await createLog("Error", username, "Error fetching historic");
        res.status(500).send(createResponse("ERROR", `Error fetching historic: ${error.message}`));
    }
});


// Endpoint to analyze an image
app.post('/api/analitzar-imatge', [authMiddleware], async (req, res) => {
    console.log("Analitzant imatge...");
    const token = req.headers.authorization?.split(" ")[1];
    const {prompt, stream, images} = req.body;
    const userId = await getUserIdFromToken(token);
    const username = await getUsernameById(userId);
    if (!userId) {
        await createLog("Error", username, "Invalid token");
        return res.status(403).send(createResponse("ERROR", "Invalid token"));
    }
    const userRole = await getUserRole(userId);
    const requestCount = await countUserRequests(userId);
    console.log(`User ID: ${userId}, Role: ${userRole}, Requests en 24h: ${requestCount}`);
    const requestLimits = {
        free: parseInt(process.env.FREE, 10) || 0,
        premium: parseInt(process.env.PREMIUM, 10) || 0
    };
    console.log("Limite de peticiones: ",requestLimits);
    console.log("Rol usuario: ",userRole)

    if (requestCount >= (requestLimits[userRole] || 0)) {
        await createLog("Error", username, "Limit de peticions excedit");
        return res.status(429).send(createResponse("ERROR", "Limit de peticions excedit"));
    }
    console.log("Prompt: ", prompt);
    console.log("Stream: ", stream);
    console.log("Images: ", images);
    if (!prompt || !Array.isArray(images) || images.length === 0) {
        await createLog("Error", username, "Invalid input data");
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
        await createLog("Resposta", username, data["response"]);
        await createRequest(userId, prompt, "llama3.2-vision", JSON.stringify(images), data["response"]);
        console.log(data["response"]);
        res.send(createResponse("OK", "Maria image processed", data["response"]));
    }else{
        console.log("Error processant imatge: ",response.statusText);
        await createLog("Error", username, "Error processing image");
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
        const { token, username, telefon, email, pla } = req.body;
        const userId = await getUserIdFromToken(token);
        const userName = await getUsernameById(userId);
    
    
        if (!token || !pla || (!username && !telefon && !email)) {
            await createLog("Error", userName, "Token, plan and at least one of username, telefon, or email must be provided");
            return res.status(400).send(createResponse("ERROR", "Token, plan and at least one of username, telefon, or email must be provided"));
        }
        const isAdmin = await verifyAdminToken(token);
        if (!isAdmin) {
            await createLog("Error", userName, "Token does not belong to an admin");
            return res.status(403).send(createResponse("ERROR", "Token does not belong to an admin"));
        }
        // const user = await User.findOne({ where: { username }, raw: true });
        // if (!user) {
        //     return res.status(404).send(createResponse("ERROR", "User not found"));
        // }
        const validRoles = ['free', 'premium', 'admin'];
        if (!validRoles.includes(pla)) {
            await createLog("Error", userName, "Invalid role provided");
            return res.status(400).send(createResponse("ERROR", "Invalid role provided"));
        }

        const searchCriteria = {};
        if (username) searchCriteria.username = username;
        if (telefon) searchCriteria.telefon = telefon;
        if (email) searchCriteria.email = email;

        await changeUserRole(searchCriteria, pla);
        await createLog("Actualitzar pla", userName, "User plan updated successfully");
        res.send(createResponse("OK", "User plan updated successfully", { username, pla }));
    } catch (error) {
        console.error(error);
        await createLog("Error", userName, "Error updating user plan: ${error.message}");
        res.status(500).send(createResponse("ERROR", `Error updating user plan: ${error.message}`));
    }
});

//Endpoint to list users
app.get('/api/admin/usuaris', [authMiddleware], async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userId = await getUserIdFromToken(token);
        const username = await getUsernameById(userId);
        const users = await getAllUsers();
        await createLog("Llistar usuaris", username, "Users fetched successfully");
        res.send(createResponse("OK", "Users fetched successfully", users));
    } catch (error) {
        console.error(error);
        await createLog("Error", username, "Error fetching users");
        res.status(500).send(createResponse("ERROR", `Error fetching users: ${error.message}`));
    }
});

app.post('/api/admin/usuaris/logs', [authMiddleware], async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const isAdmin = await verifyAdminToken(token);
        const userId = await getUserIdFromToken(token);
        const username = await getUsernameById(userId);

        if (!isAdmin) {
            await createLog("Error", username, "User is not an admin");
            return res.status(403).send(createResponse("ERROR", "User is not an admin"));
        }

        const logs = await getLogs();
        await createLog("Obtenció de logs", username, "Get logs successfully");
        return res.send(createResponse("OK", "Get logs successfully", { logs }));
    } catch (error) {
        console.error(error);
        await createLog("Error", username, `Error getting logs: ${error.message}`);
        res.status(500).send(createResponse("ERROR", `Error getting logs: ${error.message}`));
    }
});

app.post('/api/admin/usuaris/logs/counted', [authMiddleware], async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const isAdmin = await verifyAdminToken(token);
        const userId = await getUserIdFromToken(token);
        const username = await getUsernameById(userId);

        if (!isAdmin) {
            await createLog("Error", username, "User is not an admin");
            return res.status(403).send(createResponse("ERROR", "User is not an admin"));
        }

        const logs = await getLastHourLogs();
        const countedLogs = logs.reduce((acc, log) => {
            if (!acc[log["tag"]]) {
                acc[log["tag"]] = 1;
            } else {
                acc[log["tag"]]++;
            }
            return acc;
        }, {});
        await createLog("Obtenció de logs", username, "Get logs successfully");
        return res.send(createResponse("OK", "Get logs successfully", countedLogs ));
    } catch (error) {
        console.error(error);
        await createLog("Error", username, `Error getting logs: ${error.message}`);
        res.status(500).send(createResponse("ERROR", `Error getting logs: ${error.message}`));
    }
});