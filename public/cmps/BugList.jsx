const { Link } = ReactRouterDOM
import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug, sortBy }) {

    if (!bugs) return <div>Loading...</div>

    const sortedBugs = bugs.slice().sort((a, b) => {
        if (!sortBy.sortField) return 0
        const valueA = a[sortBy.sortField] || ''
        const valueB = b[sortBy.sortField] || ''

        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sortBy.sortDir * (valueA - valueB)
        }
        return sortBy.sortDir * valueA.localeCompare(valueB)
    })

    return <ul className="bug-list">
        {sortedBugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button><Link to={`/bug/${bug._id}`}>Details</Link></button>
                    <button onClick={() => onEditBug(bug)}>Edit</button>
                    <button onClick={() => onRemoveBug(bug._id)}>x</button>
                </section>
            </li>
        ))}
    </ul >
}
