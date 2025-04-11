'use client'; // This is a client component

import { useState } from 'react';

export default function Home() {
  const [sequence, setSequence] = useState('P01349');
  const [database, setDatabase] = useState('nt'); // Default database
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResults('');
    setError('');

    try {
      const response = await fetch('/api/run-blast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence, database }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run BLAST');
      }

      const data = await response.text();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Local BLAST Interface</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="sequence">Sequence:</label>
          <textarea
            id="sequence"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            rows="5"
            cols="50"
            placeholder="Enter your sequence id (FASTA format)"
            required
          />
        </div>
        <div>
          <label htmlFor="database">Database:</label>
          <select
            id="database"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
          >
            <option value="nr">Protein (nr)</option>
            {/* Add more databases as needed */}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Running BLAST...' : 'Run BLAST'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {results && (
        <div>
          <h2>BLAST Results</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{results}</pre>
        </div>
      )}
    </div>
  );
}