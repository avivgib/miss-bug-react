import fs from 'fs'
import PDFDocument from 'pdfkit-table'
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    save,
    remove,
    generateBugsPdf
}

let bugs = []

function loadBugs() {
    bugs = utilService.readJsonFile('data/bugs.json')
}

function reloadBugs() {
    bugs = utilService.readJsonFile('data/bugs.json')
}

loadBugs()


function query(query) {
    const queryOptions = _parseQueryParams(query)
    let bugsToReturn = [...bugs]

    // Load from backup
    if (!bugsToReturn.length) {
        console.log('Bugs list is empty, restoring from backup...')
        bugsToReturn = utilService.readJsonFile('data/bugs-backup.json')
        _saveBugsToFile(bugsToReturn)
    }

    // Filtering & sorting 
    bugsToReturn = _applyFiltersAndSort(bugsToReturn, queryOptions.filterBy, queryOptions.sortBy)

    // Pagination
    const totalBugs = bugsToReturn.length
    const { pageIdx, pageSize } = queryOptions.pagination
    const startIdx = pageIdx * pageSize
    bugsToReturn = bugsToReturn.slice(startIdx, startIdx + pageSize)

    return Promise.resolve({ bugs: bugsToReturn, total: totalBugs })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`Cannot find bug - ${bugId}`)
    return Promise.resolve(bug)
}

function save(bugToSave) {
    const bugs = utilService.readJsonFile('data/bugs.json')

    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = { _id: bugToSave._id, ...bugToSave }
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

function generateBugsPdf(res) {
    query({ filterBy: {}, sortBy: {}, pagination: {} })
        .then(({ bugs }) => {
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

function _saveBugsToFile(bugs) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) return reject('Failed to save bugs to file')
            return resolve()
        })
    })
}

function _applyFiltersAndSort(bugsToReturn, filterBy, sortBy) {
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
        bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.labels.length) {
        bugsToReturn = bugsToReturn.filter(bug =>
            filterBy.labels.some(label => bug?.labels?.includes(label))
        )
    }

    const { sortField, sortDir } = sortBy
    bugsToReturn.sort((bug1, bug2) => {
        const title1 = bug1.title || ''
        const title2 = bug2.title || ''
        if (sortField === 'title') {
            return title1.localeCompare(title2) * sortDir
        }
        return ((bug1[sortField] || 0) - (bug2[sortField] || 0)) * sortDir
    })

    return bugsToReturn
}

function _parseQueryParams(queryParams) {
    const filterBy = {
        txt: queryParams.txt || '',
        minSeverity: +queryParams.minSeverity || 0,
        labels: queryParams.labels ? (Array.isArray(queryParams.labels) ? queryParams.labels : [queryParams.labels]) : []
    }

    const sortBy = {
        sortField: queryParams.sortField || 'title',
        sortDir: +queryParams.sortDir || 1,
    }

    const pagination = {
        pageIdx: +queryParams.pageIdx || 0,
        pageSize: +queryParams.pageSize || 10,
    }

    return { filterBy, sortBy, pagination }
}
