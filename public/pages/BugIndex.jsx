const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { utilService } from '../services/util.service.js'
import { authService } from '../services/auth.service.js'

export function BugIndex() {
    const [bugs, setBugs] = useState([])
    const [totalBugs, setTotalBugs] = useState(0)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState({ sortField: 'title', sortDir: 1 })
    const [pagination, setPagination] = useState({ pageIdx: 0, pageSize: 4 })
    const [user, setUser] = useState(authService.getLoggedInUser())

    useEffect(loadBugs, [filterBy, sortBy, pagination, user])

    function loadBugs() {
        const queryOptions = { filterBy, sortBy, pagination, userId: user ? user._id : null }
        // console.log('Query Options:', queryOptions)

        bugService.query(queryOptions)
            .then(({ bugs, total }) => {
                console.log('Full Response:', bugs)
                setBugs(bugs)
                setTotalBugs(total)
            })
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
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

    function onSetSort(sortField) {
        setSortBy(prev => ({
            sortField,
            sortDir: prev.sortField === sortField ? prev.sortDir * -1 : 1
        }))
    }

    function nextPage() {
        if ((pagination.pageIdx + 1) * pagination.pageSize < totalBugs) {
            setPagination(prev => ({ ...prev, pageIdx: prev.pageIdx + 1 }))
        }
    }

    function prevPage() {
        setPagination(prev => ({ ...prev, pageIdx: Math.max(prev.pageIdx - 1, 0) }))
    }

    function getSortIcon(field, sortBy) {
        if (sortBy.sortField !== field) {
            return field === "severity" ? "fa-arrow-up-1-9" : "fa-arrow-up-a-z"
        }
        return sortBy.sortDir === 1
            ? (field === "severity" ? "fa-arrow-down-1-9" : "fa-arrow-down-a-z")
            : (field === "severity" ? "fa-arrow-up-1-9" : "fa-arrow-up-a-z")
    }
    
    return <section className="bug-index main-content">
        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        
        <header>
            <h3>Bug List</h3>
            <section className="btn-container">
                <button onClick={onSaveBug}><i className="fa-solid fa-plus"></i></button>
                {/* <button>
                    <a href='/api/bug/bugs-pdf'>
                        <i className="fa-solid fa-download"></i>
                    </a>
                </button> */}
                <button onClick={onDownloadBugs}><i className="fa-solid fa-download"></i></button>
                <button onClick={() => onSetSort("severity")}><i className={`fa-solid ${getSortIcon("severity", sortBy)}`}></i></button>
                <button onClick={() => onSetSort("title")}><i className={`fa-solid ${getSortIcon("title", sortBy)}`}></i></button>

            </section>
        </header>

        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} sortBy={sortBy}/>

        <section className="btn-pagination">
            <button onClick={prevPage} disabled={pagination.pageIdx === 0}>Prev</button>
            <button onClick={nextPage} disabled={(pagination.pageIdx + 1) * pagination.pageSize >= totalBugs}>Next</button>
        </section>

    </section>
}
