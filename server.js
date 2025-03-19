import express from 'express'
import { bugService } from './services/bug.service.js'

const app = express()
app.use(express.static('public'))

//* Read
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => {
            res.status(200).send(bugs)
        })
        .catch(err => {
            console.log('Cannot get bugs', err)
            res.status(500).send('Cannot load bugs')
            // res.status(500).json({ error: err })
        })
})

app.get('/api/bug/save', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: req.query.createdAt
    }

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => res.status(500).send('Cannot save bug'))
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => res.status(500).send('Cannot load bug'))
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('bug Removed'))
        .catch(err => res.status(500).send('Cannot remove bug'))
})

const port = 3030
app.listen(port, () =>
    console.log(`Server ready at port ${port}`)
)