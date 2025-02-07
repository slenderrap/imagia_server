const {User, Logs, Request} = require('./index');
const { Op } = require("sequelize");

const createUser = async (
    username, 
    email, 
    password, 
    phone_number, 
    nickname = null,
    tokens = null,
    sms = null
 ) => {
    try {
        const existingUsername = await User.findOne({ 
            where: { username }
        });
        
        if (existingUsername) {
            throw new Error('Username already exists');
        }
 
        return await User.create({
            username,
            email,
            password,
            phone_number,
            nickname,
            tokens,
            role: 'free',
            is_active: false,
            sms
        });
    } catch (error) {
        if (error.message === 'Username already exists') {
            throw error;
        }
        throw new Error(`Error creating user: ${error.message}`);
    }
};


const createRequest = async (
    userId, 
    prompt, 
    model = null, 
    picture = null,
    answer = null
) => {
    try {
        return await Request.create({
            user_id: userId,
            prompt,
            model,
            picture,
            answer,
            prompt_date: new Date()
        });
    } catch (error) {
        throw new Error(`Error creating request: ${error.message}`);
    }
};

const verifyUserAndPassword = async (username, password) => {
    try {
        const user = await User.findOne({
            where: { username, password },
            attributes: ['id', 'tokens'],
            raw: true
        });
        if (user) {
            return user.tokens;
        } else {
            throw new Error('Invalid username or password');
        }
    } catch (error) {
        throw new Error(`Error verifying user and password: ${error.message}`);
    }
};

const getAllUsers = async () => {
    try {
        const users = await User.findAll({
            raw: true
        });
        return users;
    } catch (error) {
        throw new Error(`Error getting all users: ${error.message}`);
    }
};

const verifyAdminToken = async (token) => {
    try {
        const user = await User.findOne({
            where: { tokens: token },
            attributes: ['role'],
            raw: true
        });
        
        if (user && user.role === 'admin') {
            return true;
        } else {
            throw new Error('Token does not belong to an admin user');
        }
    } catch (error) {
        throw new Error(`Error verifying admin token: ${error.message}`);
    }
};

const getUserIdFromToken = async (token) => {
    try {
        const user = await User.findOne({
            where: { tokens: token },
            attributes: ['id'],
            raw: true
        });
        
        if (user) {
            return user.id;
        } else {
            throw new Error('Token not found');
        }
    } catch (error) {
        throw new Error(`Error getting userId from token: ${error.message}`);
    }
};


const activateUser = async (username) => {
    try {
        return await User.update(
            { is_active: true },
            { where: { username } }
        );
    } catch (error) {
        throw new Error(`Error activating user: ${error.message}`);
    }
};

const deactivateUser = async (username) => {
    try {
        return await User.update(
            { is_active: false },
            { where: { username } }
        );
    } catch (error) {
        throw new Error(`Error deactivating user: ${error.message}`);
    }
};

const addSmsToUser = async (username, sms) => {
    try {
        return await User.update(
            { sms },
            { where: { username } }
        );
    } catch (error) {
        throw new Error(`Error adding SMS to user: ${error.message}`);
    }
};

const verifySmsFromUser = async (username, sms) => {
    try {
        const user = await User.findOne({
            where: { username, sms },
            raw: true
        });
        if (user) {
            return true;
        }
        return false;
    } catch (error) {
        throw new Error(`Error verifying SMS: ${error.message}`);
    }
};

const getUserRequests = async (userId) => {
    try {
        const requests = await Request.findAll({
            where: { user_id: userId },
            attributes: ['prompt_date', 'answer'],
            order: [['prompt_date', 'DESC']],
            raw: true
        });
        return requests;
    } catch (error) {
        throw new Error(`Error getting user requests: ${error.message}`);
    }
};

const getUserRole = async (userId) => {
    try {
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['role'],
            raw: true
        });
        return user;
    } catch (error) {
        throw new Error(`Error getting user role: ${error.message}`);
    }
};

const getUserPassword = async (username) => {
    try {
        const user = await User.findOne({
            where: { username },
            attributes: ['password'],
            raw: true
        });
        return user;
    } catch (error) {
        throw new Error(`Error getting user password: ${error.message}`);
    }
};

const changeUserRole = async (searchCriteria, newRole) => {
    try {
        if (!['free', 'premium', 'admin'].includes(newRole)) {
            throw new Error('Invalid role');
        }
        const result = await User.update(
            { role: newRole },
            { where: searchCriteria }
        );
        
        if (result[0] === 0) {
            throw new Error('No user matched the provided criteria');
        }

        return result;
    } catch (error) {
        throw new Error(`Error updating user role: ${error.message}`);
    }
};

const addTokenToUser = async (username, token) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (user) {
            user.tokens = token;
            await user.save();
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        throw new Error(`Error adding token to user: ${error.message}`);
    }
};

const getTokenFromUser = async (username) => {
    try {
        const user = await User.findOne({
            where: { username },
            attributes: ['tokens'],
            raw: true
        });
        return user ? user.tokens : null;
    } catch (error) {
        throw new Error(`Error getting token from user: ${error.message}`);
    }
};

const getUserPhone = async (username) => {
    try {
        const user = await User.findOne({
            where: { username },
            attributes: ['phone_number'],
            raw: true
        });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (!user.phone_number) {
            throw new Error('User has no phone number');
        }

        return user.phone_number;
    } catch (error) {
        throw new Error(`Error getting user phone: ${error.message}`);
    }
};


const verifyToken = async (token) => {
    try {
        const user = await User.findOne({
            where: { tokens: token },
            raw: true
        });
        return user !== null;
    } catch (error) {
        throw new Error(`Error verifying token: ${error.message}`);
    }
};

const createLog = async (tag, username = null, response = null) => {
    try {
        return await Logs.create({
            log_date: new Date(),            
            tag,
            username,
            response
        });
    } catch (error) {
        throw new Error(`Error inserting log: ${error.message}`);
    }
};

const countUserRequests = async (userId) => {
    try {
        const count = await Request.count({
            where: {
                user_id: userId,
                prompt_date: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)                }
            }
        });
        return count;
    } catch (error) {
        throw new Error(`Error counting user requests: ${error.message}`);
    }
};

const getUsernameById = async (userId) => {
    try {
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['username'],
            raw: true
        });
        if (user) {
            return user.username;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        throw new Error(`Error getting username from userId: ${error.message}`);
    }
};

const getLogs = async () => {
    try {
        const logs = await Logs.findAll({
            order: [['log_date', 'DESC']],
            raw: true
        });
        return logs;
    } catch (error) {
        throw new Error(`Error getting all logs: ${error.message}`);
    }
};

module.exports = {
    createUser,
    deactivateUser,
    activateUser,
    createLog,
    changeUserRole,
    createRequest,
    getUserRequests,
    getUserRole,
    getUserPassword,
    getAllUsers,
    addTokenToUser,
    getTokenFromUser,
    getUserIdFromToken,
    addSmsToUser,
    verifySmsFromUser,
    getUserPhone,
    verifyToken,
    verifyUserAndPassword,
    verifyAdminToken,
    getUsernameById,
    countUserRequests,
    getLogs,
    getAllUsers
};