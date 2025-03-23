import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { utilService } from './services/util.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug/bugs-pdf', (req, res) => {
    loggerService.info('Downloading PDF bugs report')
    bugService.generateBugsPdf(res)
})

//* Fetch all bugs
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => {
            loggerService.info('Fetched all bugs')
            res.status(200).send(bugs)
        })
        .catch(err => {
            loggerService.error('Failed to fetch bugs', err)
            res.status(500).send('Cannot load bugs')
        })
})

//* Edit Bug & Create New Bug
app.get('/api/bug/save', (req, res) => {
    const { _id, title, description, severity } = req.query

    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        createdAt: Date.now()
    }

    bugService.save(bugToSave)
        .then(bug => {
            loggerService.info(`Bug saved with ID - ${bug._id}`)
            res.send(bug)
        })
        .catch(err => {
            loggerService.error('Failed to save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//* Get Bug By Id
app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    let visitedBugs = req.cookies.visitedBugs || []

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)

        if (visitedBugs.length > 3) {
            loggerService.error('More than 3 visits in 10 seconds')
            return res.status(401).send('Wait for a bit')
        }

        res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
        console.log('User visited the following bugs:', visitedBugs)
        loggerService.info(`User visited the following bugs - ${visitedBugs}`)
    }

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
app.get('/api/bug/:bugId/remove', (req, res) => {
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