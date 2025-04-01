import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { authService } from './services/auth.service.js'
import { userService } from './services/user.service.js'

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
    bugService.query(req.query)
        .then(({ bugs, total }) => {
            loggerService.info(`Fetched ${bugs.length} bugs, total: ${total}`)
            res.status(200).send({ bugs, total })
        })
        .catch(err => {
            loggerService.error('Failed to fetch bugs', err)
            res.status(500).send('Failed to fetch bugs')
        })
})

// Create New Bug
app.post('/api/bug', (req, res) => {
    const authenticatedUser = authService.validateToken(req.cookies.loginToken)
    if (!authenticatedUser) return res.status(401).send('Unauthorized: Please log in to add a bug')

    const bugToSave = {
        ...req.body,
        createdAt: Date.now(),
        creator: {
            _id: authenticatedUser._id,
            fullname: authenticatedUser.fullname
        }
    }
    // console.log('bugToSave', bugToSave)

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
    const { bugId } = req.params
    const authenticatedUser = authService.validateToken(req.cookies.loginToken)
    if (!authenticatedUser) return res.status(401).send('Unauthorized: Please log in to update the bug')

    bugService.getById(bugId)
        .then(bug => {
            if (bug.creator._id !== authenticatedUser._id) {
                return res.status(403).send('Not authorized to update this bug')
            }

            const bugToUpdate = { ...bug, ...req.body }

            bugService.save(bugToUpdate)
                .then(updatedBug => {
                    loggerService.info(`Bug update with ID - ${updatedBug._id}`)
                    res.send(updatedBug)
                })
                .catch(err => {
                    loggerService.error('Failed to update bug', err)
                    res.status(500).send('Cannot update bug')
                })
        })
        .catch(err => {
            loggerService.error('Bug not found', err)
            res.status(404).send('Bug not found')
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
    const authenticatedUser = authService.validateToken(req.cookies.loginToken)
    if (!authenticatedUser) return res.status(401).send('Unauthorized: Please log in to delete the bug')

    console.log('authenticatedUser', authenticatedUser)

    bugService.getById(bugId)
        .then(bug => {
            if (bug.creator._id !== authenticatedUser._id) {
                return res.status(403).send('Not authorized to delete this bug')
            }

            bugService.remove(bugId)
                .then(() => {
                    loggerService.info(`Bug removed with ID - ${bugId}`)
                    res.send('Bug Removed')
                })
                .catch(err => {
                    loggerService.error('Failed to remove bug', err)
                    res.status(500).send('Cannot remove bug')
                })
        })
        .catch(err => {
            loggerService.error('Bug not found', err)
            res.status(500).send('Bug not found')
        })
})

// Auth API
app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => res.status(404).send(`Username Taken - ${err}`))
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    // console.log(`credentials: ${JSON.stringify(credentials)}`)

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out')
})


// Admin Options
// Fetch all users
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Failed to fetch users', err)
            res.status(500).send('Cannot fetch users')
        })
})

// Get user by ID
app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Failed to fetch user', err)
            res.status(500).send('Cannot fetch user')
        })
})

// Delete user
app.delete('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.remove(userId)
        .then(() => res.send({ msg: 'User deleted' }))
        .catch(err => {
            loggerService.error('Failed to delete user', err)
            res.status(500).send('Cannot delete user')
        })
})


const port = 3030
app.listen(port, () =>
    loggerService.info(`Server ready at port ${port}`)
)