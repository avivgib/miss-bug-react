import fs from 'fs'
import Cryptr from 'cryptr'
import { utilService } from './util.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')
const users = utilService.readJsonFile('data/users.json')

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    signup
}

function query() {
    const userToReturn = users.map(user => ({ _id: user._id, fullname: user.fullname }))
    return Promise.resolve(userToReturn)
}

function getById(userId) {
    var user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('User not found')

    user = { ...user }
    delete user.password
    return Promise.resolve(user)
}

function getByUsername(username) {
    var user = users.find(user => user.username === username)
    return Promise.resolve(user)
}

function remove(userId) {
    users = users.filter(user => user._id !== userId)
    return _saveUsersToFile()
}

function signup({ fullname, username, password }) {
    if (!fullname || !username || !password) {
        return Promise.reject('Incomplete credentials')
    }

    const user = {
        _id: utilService.makeId(),
        fullname,
        username,
        password,
        isAdmin: false
    }
    users.push(user)

    return _saveUsersToFile()
        .then(() => ({
            _id: user._id,
            fullname: user.fullname,
            isAdmin: user.isAdmin
        }))
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/users.json', usersStr, err => {
            if (err) {
                return console.log(err)
            }
            resolve()
        })
    })
}