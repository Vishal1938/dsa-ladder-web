import { Link } from "react-router-dom";
export default function NotFound() {
  return <main className="page narrow"><h1>Page not found</h1><p className="muted">That page doesn't exist.</p><Link className="btn" to="/">Back to the ladders</Link></main>;
}
