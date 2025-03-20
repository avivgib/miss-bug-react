import { utilService } from "./util.service.js"
import { storageService } from './async-storage.service.js'
import { saveAs } from "file-saver"

const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    remove,
    save,
    getDefaultFilter,
    downloadPdf
}

function query(filterBy = {}) {
    return axios.get(BASE_URL)
        .then(res => res.data)
        .then(bugs => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }
            if (filterBy.minSeverity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
            }
            return bugs
        })
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove')
        .then(res => res.data)
}

function save(bug) {
    const url = BASE_URL + 'save'
    let queryParams = `?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`

    if (bug._id) queryParams += `&_id=${bug._id}`
    return axios.get(url + queryParams)
        .then(res => res.data)
        .catch(err => {
            console.log('err:', err)
        })
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}

function downloadPdf() {
    axios.get('http://localhost:3030/api/bug/bugs-pdf', { responseType: 'blob' })
        .then(res => {
            const blob = res.data // The data will arrive as a Blob
            const url = URL.createObjectURL(blob) // Creates a temporary URL
            window.open(url, '_blank') // Open in new tab (or start download)
            setTimeout(() => URL.revokeObjectURL(url), 10000) // Releases memory after 10 seconds
        })
        .catch(err => showErrorMsg(`Error downloading PDF - ${err.message}`))
}
