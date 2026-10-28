# Proposal Triage API

A Node.js backend prototype for extracting information from contractor proposals and evaluating them using eligibility checks and weighted scoring.

## Prerequisites

- Node.js and npm
- A Gemini API key

## Installation

Install the project dependencies:

```bash
npm install
```

## Environment Setup

Create a `.env` file in the project root using `.env.example` as a reference.

Add the required environment variables, including your Gemini API key. Do not commit `.env` or expose your API key.

## Running the Server

Start the API using the command defined in `package.json`.

## Testing

The project includes scripts for testing PDF input, Gemini extraction, multiple proposals, and scoring. Check `package.json` for the available commands.

## Limitations

This is a backend-only prototype. It does not include a frontend, and proposal extraction depends on the availability of the Gemini API. Human review is still needed when important information is missing or unclear.
