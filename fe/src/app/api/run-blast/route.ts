import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request) {
  const { sequence, database } = await request.json();

  if (!sequence || !database) {
    return NextResponse.json({ error: 'Sequence and database are required.' }, { status: 400 });
  }

  try {
    const blastProcess = spawn('docker', [
      'exec',
      'blastigv-blast-1',
      'blastp', // Or other BLAST program (e.g., blastp, blastx)
      '-db',
      `nurse-shark-proteins`,
      '-query',
      '/blast/queries/P01349.fsa', // To Read query from stdin, specify '-'
      '-outfmt',
      '6', // Tabular output format (you can adjust this)
    ]);

    let stdout = '';
    let stderr = '';

    blastProcess.stdin.write(sequence);
    blastProcess.stdin.end();

    for await (const chunk of blastProcess.stdout) {
      stdout += chunk;
    }

    for await (const chunk of blastProcess.stderr) {
      stderr += chunk;
    }

    const exitCode = await new Promise((resolve) => {
      blastProcess.on('close', resolve);
    });

    if (exitCode !== 0) {
      console.error('BLAST error:', stderr);
      return NextResponse.json({ error: `BLAST execution failed: ${stderr}` }, { status: 500 });
    }

    return new Response(stdout, { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error('Error running BLAST:', error);
    return NextResponse.json({ error: 'Failed to run BLAST.' }, { status: 500 });
  }
}