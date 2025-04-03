const BASE_URL = '/api/user/'

export const userService = {
    query,              //	Send a GET request to server to get user list
    getById,            //	Send a GET request to server to get user by id
    getEmptyCredentials //	Return an empty object for login/signup forms    
}

function query() {
    return axios.get(BASE_URL)
        .then(res => res.data)
}

function getById(userId) {
    return axios.get(BASE_URL + userId)
        .then(res => res.data)
}

function getEmptyCredentials() {
    return { 
        username: '', 
        password: '', 
        fullname: '' 
    }
}