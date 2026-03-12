// API route for the training dashboard
// Reads the agent state file from the models directory, and returns it as JSON
// This has to be a server-side route because the state file lives on the filesystem
// and cannot be accessed directly from the browser

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to the agent state file written by DQNAgent.save()
const STATE_FILE = path.resolve(process.cwd(), 'models', 'five-realms-dqn-agent-state.json');

export async function GET() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return NextResponse.json(
        { error: 'No training data found. Training script might not have been run yet' },
        { status: 404 }
      );
    }

    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[training-stats] Failed to read state file:', error);
    return NextResponse.json(
      { error: 'Failed to read training state file.' },
      { status: 500 }
    );
  }
}