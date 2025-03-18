import express from 'express'

const app = express()
app.get('/', (req, res) => res.send('Hello There'))
app.get('/api/aviv', (req, res) => res.send('Hello Aviv'))
app.listen(3030, () => console.log('Server ready at port 3030'))