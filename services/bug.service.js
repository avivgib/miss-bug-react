import fs from 'fs'
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    save,
    remove
}

function query() {
    let bugs = utilService.readJsonFile('data/bugs.json')
    
    if (bugs.length === 0) {
        console.log('Bugs list is empty, restoring from backup...')
        bugs = utilService.readJsonFile('data/bugs-backup.json')
        _saveBugsToFile(bugs)
    }

    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bugs = utilService.readJsonFile('data/bugs.json')

    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`Cannot find bug - ${bugId}`)
    return Promise.resolve(bug)
}

function save(bugToSave) {
    const bugs = utilService.readJsonFile('data/bugs.json')

    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugs.unshift(bugToSave)
    }

    return _saveBugsToFile(bugs).then(() => bugToSave)
}

function remove(bugId) {
    let bugs = utilService.readJsonFile('data/bugs.json')
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject(`Cannot find bug - ${bugId}`)
    bugs.splice(bugIdx, 1)
    
    return _saveBugsToFile(bugs)
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
