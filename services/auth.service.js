import Cryptr from 'cryptr'
import { userService } from './user.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')

export const authService = {
    checkLogin,
	getLoginToken,
	validateToken,
}

function checkLogin({ username, password }) {
    return userService.getByUsername(username)
        .then(user => {
            if (user && user.password === password) {
                user = { ...user }
                delete user.password
                return Promise.resolve(user)
            }
            return Promise.reject('Invalid credential')
        })
}

function getLoginToken(user) {
	const str = JSON.stringify(user)
	return cryptr.encrypt(str)
}

function validateToken(token) {
	if (!token) return null
    
	const str = cryptr.decrypt(token)
	return JSON.parse(str)
}