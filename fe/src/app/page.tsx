'use client'; // This is a client component

import { useState, useRef, useEffect } from 'react';
import igv from 'igv/dist/igv.esm.min.js';

export default function Home() {

  const RANDOM_DNA="TGATTGGTCCACTAAAGTTGATTAAATCAACTCCTAAATCCGCGCGATAGGGCATTAGAGGTTTAATTTTGTATGGCAAGGTACTCCCGATCTTAATGAATGGCCGGAAGTGGTACGGACGCAATATGCGCGGGTGAGAGGGCAAATAGGCAGGTTCGCCTACGTTACGCTAGGGGGCGATTCTATAAGAATGCACATTGCATCGATACATAAGATGTCTCGACCGCATGCGCAACTTGTGAAGTGTCTACTATCCCTAAGCCCATTTCTCGCACAATAACCCCTGAATGTGTCCGCATCTGATGTTACCCGGGTTGAGTTAGTGTCGAGCTCGCGGAACTTATTGCATGAGTAGAGATATGTAAGAGCTGTTAGATAGCTCGCTGAGCTAATAGTTGCCCACAGAACGTCAAAATTAGAGAACGGTCGTAACATTATCGGTGGTTCTCTAACTACTATCAGTACCCATGACTCGACTCTGCCGCAGCTACCTATCGCCTGAAAGCCAGTTGGTGTTAAGGAGTGCTCTGTCCAGGACAACACGCGTAGTGAGAGTTACATGTTCGTTGGGTTCTCCCGACTCGGACCTGAGTCGACCAAGGACCCACTCGAGCTCTGAGCCCCACTGTCGAGAAGTATGTATCTCGCTCCCGCAGCTTGCCAGCACTTTCAGTATCATGGGGCCCATGGTTGAATGACTCCTATAACGGACTTCGACATGGCAAAATCCCCCCCTTGCAACTTCTAGAGGAGAAGAGTACTGACTTGAGCGCTCCCAGCACAACGGCCAAGGAAGTCTCCAATTTCTTGTTTCCGAATGACACGCGTCTCCTTGCGGGTAAATCGCCGACCGCAGAACTTAGGAGCCAGGGGGAACAGATAGGTCTAATTAGGTTAAGGGAGTAAGTCCTCGGATGGTTCAGTTGTAACCATATACTTACGCTGGAACTTCTCCGGCGAATTTTTACTGTCACCAACCACGAGATTTGAGGTAAACCAA"

  const [sequence, setSequence] = useState(RANDOM_DNA);
  const [pid, setPid] = useState('P01349');
  const [database, setDatabase] = useState('nt'); // Default database
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const igvDiv = useRef(null);

  useEffect(() => {
    if (igvDiv.current && sequence) {
      const options = {
        genome: 'hg38', // No reference genome for a raw sequence
        locus: "chr8:127,736,588-127,739,371", // A placeholder locus
        tracks: [
          {
            type: 'sequence',
            format: 'fasta',
            data: sequence,
            name: 'Input Sequence',
          },
          // Add more tracks for annotations if you have them (e.g., BED format)
        ],
      };

      igv.createBrowser(igvDiv.current, options)
        .then(browser => {
          console.log('IGV browser created');
          // You can store the browser instance if needed:
          // igvBrowserInstance.current = browser;
          browser.setLocus(`1:1-${sequence.length}`);
        })
        .catch(error => {
          console.error('Error creating IGV browser:', error);
        });
    }
  }, [sequence]);

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
        body: JSON.stringify({ sequence: pid, database }),
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
            placeholder="Enter your sequence to display in IGV"
          />
        </div>

      {sequence && (
        <div>
          <h2>Input Sequence Visualization (Conceptual):</h2>
          <div ref={igvDiv} style={{ height: '150px', border: '1px solid lightgray' }}></div>
        </div>
      )}

        <div>
          <label htmlFor="pid">Pid:</label>
          <textarea
            id="pid"
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            rows="1"
            cols="10"
            placeholder="Enter your protein id"
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