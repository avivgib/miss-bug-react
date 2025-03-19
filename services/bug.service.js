import fs from 'fs'
import { utilService } from './util.service.js'

const bugs = utilService.readJsonFile('data/bugs.json')

export const bugService = {
    query,
    getById,
    save,
    remove
}

function query() {
    return _loadBugs()
}

function getById(bugId) {
    return _loadBugs()
        .then(bugs => {
            const bug = bugs.find(bug => bug._id === bugId)
            if (!bug) return Promise.reject(`Cannot find bug - ${bugId}`)
            return bug
        })
}

function save(bugToSave) {
    return _loadBugs()
        .then(bugs => {
            if (bugToSave._id) {
                const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
                if (bugIdx !== -1) {
                    bugs[bugIdx] = bugToSave
                }
            } else {
                bugToSave._id = utilService.makeId()
                bugToSave.createdAt = Date.now()
                bugs.unshift(bugToSave)
            }

            return _saveBugsToFile(bugs).then(() => bugToSave)
        })
}

function remove(bugId) {
    return _loadBugs()
        .then(bugs => {
            const bugIdx = bugs.findIndex(bug => bug._id === bugId)
            if (bugIdx === -1) return Promise.reject(`Cannot find bug - ${bugId}`)
            bugs.splice(bugIdx, 1)
            return _saveBugsToFile(bugs)
        })
}


function _loadBugs() {
    const bugs = utilService.readJsonFile('data/bugs.json')
    if (!bugs || bugs.length === 0) { 
        return Promise.reject('Failed to load bugs') 
    }
    return Promise.resolve(bugs)
}

function _saveBugsToFile(bugs) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) return reject('Failed to save bugs to file')
            return resolve()
        })
    })
}