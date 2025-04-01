import { showErrorMsg } from "./event-bus.service.js"

const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    remove,
    save,
    getDefaultFilter,
    getLabels,
    downloadPdf
}

function query(options) {
    const { filterBy, sortBy, pagination } = options

    const queryParams = {
        txt: filterBy.txt || '',
        minSeverity: filterBy.minSeverity || 0,
        labels: filterBy.labels ? filterBy.labels.join(',') : '',
        sortField: sortBy.sortField || '',
        sortDir: sortBy.sortDir || 1,
        pageIdx: pagination.pageIdx || 0,
        pageSize: pagination.pageSize || 3
    }

    // console.log('Client - Query Params:', queryParams)

    return axios.get('/api/bug', { params: queryParams })
        .then(res => {
            console.log('Server Response:', res.data)
            return res.data
        })
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
}

function save(bug) {
    bug.labels = _processLabels(bug.labels)
    const url = BASE_URL

    if (bug._id) {
        return axios.put(url + bug._id, bug)
            .then(res => res.data)
            .catch(err => {
                console.log('err:', err)
                throw err
            })
    } else {
        return axios.post(url, bug)
            .then(res => res.data)
            .catch(err => {
                console.log('err:', err)
                throw err
            })
    }
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, labels: [], sortField: '', sortDir: 1 }
}

function getLabels() {
    return ['UI', 'Database', 'Optimization', 'Critical', 'Backend', 'Performance', 'Bug', 'Interaction']
}

// Open PDF in a new Tab
function downloadPdf() {
    return axios.get(`${BASE_URL}bugs-pdf`, { responseType: 'blob' })
        .then(res => {
            const blob = res.data
            console.log('blob', blob)                             // The data will arrive as a Blob

            // blob.arrayBuffer()
            //     .then(buffer => {
            //         console.log('buffer', buffer)
            //         const uint8View = new Uint8Array(buffer)
            //         console.log(`Binary data sample: ${uint8View.slice(0, 20)}`)
            //     })

            const url = URL.createObjectURL(blob)               // Creates a temporary URL
            window.open(url, '_blank')                          // Open in new tab (or start download)
            setTimeout(() => URL.revokeObjectURL(url), 10000)   // Releases memory after 10 seconds
        })
        .catch(err => showErrorMsg(`Error downloading PDF - ${err.message}`))
}

function _processLabels(labels) {
    return labels
        .map(label => label.trim())
        .map(label => label.toUpperCase() === 'UI' ? 'UI' : label.charAt(0).toUpperCase() + label.slice(1).toLowerCase())
}