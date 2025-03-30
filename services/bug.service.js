import fs from 'fs'
import { utilService } from './util.service.js'
import PDFDocument from 'pdfkit-table'

export const bugService = {
    query,
    getById,
    save,
    remove,
    generateBugsPdf
}

function query(filterBy = {}) {
    let bugs = utilService.readJsonFile('data/bugs.json')

    // console.log('Filtering with:', filterBy)

    if (bugs.length === 0) {
        console.log('Bugs list is empty, restoring from backup...')
        bugs = utilService.readJsonFile('data/bugs-backup.json')
        _saveBugsToFile(bugs)
    }

    console.log('filterBy server query:', filterBy)
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugs = bugs.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
        bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if(filterBy.labels && filterBy.labels.length > 0) {
        bugs = bugs.filter(bug => bug.labels && bug.labels.some(label => filterBy.labels.includes(label)))
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
        bugs[bugIdx] = { _id: bugToSave._id, ...bugToSave}
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave = { _id: bugToSave._id, ...bugToSave }
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

function generateBugsPdf(res) {
    query()
        .then(bugs => {
            const doc = new PDFDocument({ margin: 30, size: 'A4' })

            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename=bugs_report.pdf')

            doc.pipe(res)

            const table = {
                title: 'Bug Report',
                headers: ['Title', 'Severity', 'Description'],
                rows: bugs.map(bug => [bug.title, bug.severity, bug.description]),
            }

            doc.table(table, { columnsSize: [200, 100, 200] })
                .then(() => doc.end())
                .catch(err => {
                    console.error('Error generating PDF:', err)
                    res.status(500).send('Failed to generate PDF')
                })
        })
        .catch(err => {
            console.error('Error fetching bugs:', err)
            res.status(500).send('Failed to fetch bugs')
        })
}
