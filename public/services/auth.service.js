const STORAGE_KEY_LOGGED_IN_USER = 'loggedInUser'
const BASE_URL = '/api/auth/'

export const authService = {
    login,              //	Send signup request and save the user on sessionStorage
    signup,             //	Send signup request and save the user on sessionStorage
    logout,             //	Remove logged in user from cookie and sessionStorage
    getLoggedInUser,    //	Return logged in user from sessionStorage
    _setLoggedInUser    //	Set the logged in user on local memory  
}

function login({ username, password }) {
    return axios.get(BASE_URL + 'login', { username, password })
        .then(res => res.data)
        .then(_setLeggedInUser)
}

function signup({ username, password, fullname }) {
    return axios.post(BASE_URL + 'signup', { username, password, fullname })
        .then(res => res.data)
        .then(_setLoggedInUser)
}

function logout() {
    return axios.post(BASE_URL + 'logout')
        .then(() => sessionStorage.removeItem(STORAGE_KEY_LOGGED_IN_USER))
}

function getLoggedInUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGED_IN_USER))
}

function _setLoggedInUser(user) {
    const { _id, fullname, isAdmin } = user
    const userToSave = { _id, fullname, isAdmin }

    sessionStorage.setItem(STORAGE_KEY_LOGGED_IN_USER, JSON.stringify(userToSave))
    return userToSave
}