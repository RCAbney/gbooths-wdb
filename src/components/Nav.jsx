import { Link } from 'react-router-dom'

function Nav() {
  return (
    <nav>
      <ul style={{ listStyle: 'none', padding: '1rem', display: 'flex', gap: '1rem' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/all-booths">All Booths</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Nav 