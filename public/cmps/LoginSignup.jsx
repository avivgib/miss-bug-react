const { useState } = React
const { useNavigate } = ReactRouterDOM

import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"
import { userService } from "../services/user.service.js"
import { authService } from "../services/auth.service.js"

export function LoginSignup({ setLoggedInUser }) {
    const [credentials, setCredentials] = useState(userService.getEmptyCredentials())
    const [isSignup, setIsSignup] = useState(false)
    const navigate = useNavigate()

    function handleChange({ target }) {
        const { name: field, value } = target
        setCredentials((prev) => ({ ...prev, [field]: value }))
    }

    function handleSubmit(ev) {
        ev.preventDefault()
        isSignup ? signup(credentials) : login(credentials)
    }

    function login(credentials) {
        authService.login(credentials)
            .then(user => {
                setLoggedInUser(user)
                showSuccessMsg('sign')
                navigate('/bug')
            })
            .catch(err => showErrorMsg('Could not login'))
    }

    function signup(credentials) {
        authService.signup(credentials)
            .then(user => {
                setLoggedInUser(user)
                showSuccessMsg('signed in successfully')
                navigate('bug')
            })
            .catch(err => showErrorMsg('Could not signup'))
    }

    return (
        <section className="login-signup">
            <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
            <form onSubmit={handleSubmit}>
                {isSignup && <input
                    type="text"
                    name="fullname"
                    placeholder="Fullname"
                    value={credentials.fullname}
                    onChange={handleChange}
                    required
                />}
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
            </form>
            <p onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign Up"}
            </p>
        </section>
    )
}