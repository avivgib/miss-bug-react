import { bugService } from "../services/bug.service.js"

const { useState, useEffect, useRef } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })
    const labels = bugService.getLabels()
    const labelRefs = useRef([])

    // useEffect(() => {
    //     onSetFilterBy(filterByToEdit)
    // }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        if (target.type === 'number' || target.type === 'range') {
            value = +value || ''
        } else if (target.type === 'checkbox') {
            value = target.checked
        }

        setFilterByToEdit(prevFilter => {
            const newFilter = { ...prevFilter, [field]: value }
            onSetFilterBy(newFilter)
            return newFilter
        })
    }

    function toggleLabel(label) {
        setFilterByToEdit(prevFilter => {
            const updatedLabels = prevFilter.labels.includes(label)
                ? prevFilter.labels.filter(l => l !== label)
                : [...prevFilter.labels, label]

            const newFilter = { ...prevFilter, labels: updatedLabels }
            onSetFilterBy(newFilter)
            return newFilter
        })
    }

    function handleLabelKeyDown(ev, idx) {
        if (ev.key === 'ArrowRight') {
            ev.preventDefault()
            const next = labelRefs.current[idx + 1]
            if (next) next.focus()
        } else if (ev.key === 'ArrowLeft') {
            ev.preventDefault()
            const next = labelRefs.current[idx - 1]
            if (next) next.focus()
        }
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilterBy(filterByToEdit)
    }

    const { txt, minSeverity } = filterByToEdit

    return (
        <section className="bug-filter">
            <h2>Filter</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity} onChange={handleChange} type="number" min="1" max="5" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <div className="labels-container">
                    <label>Labels:</label>
                    {labels.map((label, idx) => (
                        <label key={label} className="tag">
                            <input
                                ref={(el) => (labelRefs.current[idx] = el)}
                                type="checkbox"
                                name="labels"
                                value={label}
                                checked={filterByToEdit.labels.includes(label)}
                                onChange={() => toggleLabel(label)}
                                onKeyDown={(ev) => handleLabelKeyDown(ev, idx)}
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </form>
        </section>
    )
}