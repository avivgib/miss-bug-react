import { showSuccessMsg } from "../services/event-bus.service.js"
import { authService } from "../services/auth.service.js"

const { NavLink } = ReactRouterDOM

export function AppHeader({ loggedInUser, setLoggedInUser }) {
    console.log('loggedInUser.fullname', loggedInUser)
    function onLogout() {
        authService.logout()
        setLoggedInUser(null)
        showSuccessMsg('Logged out successfully')
    }

    return <header className="app-header main-content single-row">
        <h1>Miss Bug</h1>
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/bug">Bugs</NavLink>
            <NavLink to="/about">About</NavLink>
            {loggedInUser ? (
                <section className="user-info">
                    <span>Welcome, {loggedInUser.fullname}</span>
                    <button onClick={onLogout}>Logout</button>
                </section>
            ) : (
                <NavLink to="/auth">Login</NavLink>
            )}
        </nav>
    </header>
}