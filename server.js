import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())


app.get('/api/bug/bugs-pdf', (req, res) => {
    loggerService.info('Downloading PDF bugs report')
    bugService.generateBugsPdf(res)
})

// Fetch all bugs
app.get('/api/bug', (req, res) => {
    const queryOptions = parseQueryParams(req.query)
    // console.log('Parsed query options:', queryOptions)
    const { filterBy } = queryOptions

    bugService.query(filterBy)
        .then(bugs => {
            loggerService.info('Fetched all bugs')
            res.status(200).send(bugs)
        })
        .catch(err => {
            loggerService.error('Failed to fetch bugs', err)
            res.status(500).send('Failed to fetch bugs')
        })
})

function parseQueryParams(queryParams) {
    const filterBy = {
        txt: queryParams.txt || '',
        minSeverity: +queryParams.minSeverity || 0,
        labels: Array.isArray(queryParams.labels) ? queryParams.labels : queryParams.labels ? [queryParams.labels] : []
    }

    const sortBy = {
        sortField: queryParams.sortField || 'title',
        sortDir: +queryParams.sortDir || 1,
    }

    const pagination = {
        pageIdx: queryParams.pageIdx !== undefined ? +queryParams.pageIdx : 0,
        pageSize: +queryParams.pageSize || 3,
    }

    return { filterBy, sortBy, pagination }
}

// Create New Bug
app.post('/api/bug', (req, res) => {
    const bugToSave = req.body
    console.log('bugToSave', bugToSave)

    bugService.save(bugToSave)
        .then(bug => {
            loggerService.info(`Bug add with ID - ${bug._id}`)
            res.send(bug)
        })
        .catch(err => {
            loggerService.error('Failed to add bug', err)
            res.status(500).send('Cannot add bug')
        })
})

// Update Bug
app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = req.body

    bugService.save(bugToSave)
        .then(bug => {
            loggerService.info(`Bug update with ID - ${bug._id}`)
            res.send(bug)
        })
        .catch(err => {
            loggerService.error('Failed to update bug', err)
            res.status(500).send('Cannot update bug')
        })
})

//* Get Bug By Id
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const { visitedBugs = [] } = req.cookies

    if (visitedBugs.length >= 3) {
        loggerService.error('More than 3 visits in 10 seconds')
        return res.status(401).send('Wait for a bit')
    }
    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })

    bugService.getById(bugId)
        .then(bug => {
            loggerService.info(`Loaded bug with ID - ${bug._id}`)
            res.send(bug)
        })
        .catch(err => {
            loggerService.error('Failed to load bug', err)
            res.status(500).send('Cannot load bug')
        })
})

//* Remove
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            loggerService.info(`Bug removed with ID - ${bugId}`)
            res.send('bug Removed')
        })
        .catch(err => {
            loggerService.error('Failed to remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server ready at port ${port}`)
)