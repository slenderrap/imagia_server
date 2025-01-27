const {User, Request} = require('./index');

const getUserRequests = async (userId) => {
    try {
        const requests = await Request.findAll({
            where: { user_id: userId },
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
        const user = await User.findByPk(userId, {
            attributes: ['role'],
            raw: true
        });
        return user;
    } catch (error) {
        throw new Error(`Error getting user role: ${error.message}`);
    }
};

const getUserPassword = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            attributes: ['password'],
            raw: true
        });
        return user;
    } catch (error) {
        throw new Error(`Error getting user password: ${error.message}`);
    }
};


const createUser = async (
    username, 
    email, 
    password, 
    phone_number, 
    nickname = null,
    tokens = null
) => {
    try {
        return await User.create({
            username,
            email,
            password,
            phone_number,
            nickname,
            tokens,
            role: 'free',
            is_active: true
        });
    } catch (error) {
        throw new Error(`Error creating user: ${error.message}`);
    }
};

const deactivateUser = async (userId) => {
    try {
        return await User.update(
            { is_active: false },
            { where: { id: userId } }
        );
    } catch (error) {
        throw new Error(`Error deactivating user: ${error.message}`);
    }
};

const changeUserRole = async (userId, newRole) => {
    try {
        if (!['free', 'premium', 'admin'].includes(newRole)) {
            throw new Error('Invalid role');
        }
        return await User.update(
            { role: newRole },
            { where: { id: userId } }
        );
    } catch (error) {
        throw new Error(`Error updating user role: ${error.message}`);
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

module.exports = {
    createUser,
    deactivateUser,
    changeUserRole,
    createRequest,
    getUserRequests,
    getUserRole,
    getUserPassword
};