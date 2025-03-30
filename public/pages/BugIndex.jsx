const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { utilService } from '../services/util.service.js'

export function BugIndex() {
    const [bugs, setBugs] = useState([])
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    useEffect(loadBugs, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}  `))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onSaveBug() {
        const title = prompt("Enter bug title:", 'Bug ')
        const description = prompt("Enter bug description:", utilService.makeLorem(10))
        const severity = prompt("Enter bug severity (1-5):", 3)
        const labels = prompt("Enter labels (comma separated):", 'UI, Database').split(',')
        
        const newBug = {
            title,
            description,
            severity: +severity,
            labels
        }

        bugService.save(newBug)
            .then(savedBug => {
                setBugs(prevBugs => [...prevBugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                setBugs(prevBugs => prevBugs.map(currBug => currBug._id === savedBug._id ? savedBug : currBug))
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onDownloadBugs() {
        bugService.downloadPdf()
            .then(() => showSuccessMsg('PDF downloaded successfully'))
            .catch(err => showErrorMsg(`Error downloading PDF - ${err}`))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    return <section className="bug-index main-content">

        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <header>
            <h3>Bug List</h3>
            <section className="btn-container">
                <button onClick={onSaveBug}>
                    <i className="fa-solid fa-plus"></i>
                </button>
                {/* <button>
                    <a href='/api/bug/bugs-pdf'>
                        <i className="fa-solid fa-download"></i>
                    </a>
                </button> */}
                <button onClick={onDownloadBugs}>
                    <i className="fa-solid fa-download"></i>
                </button>
            </section>
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />
    </section>
}
