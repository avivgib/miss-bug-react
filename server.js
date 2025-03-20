import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())

//* Read
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => {
            res.status(200).send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot load bugs')
        })
})

//* Edit Bug & Create New Bug
app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: Date.now()
    }

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
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
            return res.status(401).send('Wait for a bit')
        }

        res.cookie('visitedBugs', visitedBugs, { maxAge: 7000, httpOnly: true })
        console.log('User visited the following bugs:', visitedBugs)
    }

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot load bug')
        })
})

//* Remove
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('bug Removed'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server ready at port ${port}`)
)