# VASP Trace

Ministry of Home Affairs hackathon — "09 VASP Trace": when a scam-linked
wallet's trail doesn't lead directly to a tagged exchange address, walk the
transaction graph outward through intermediary hops and rank candidate
exchanges by proximity and by how closely their pattern resembles known
exchange deposit behaviour, using the Elliptic dataset's graph structure
alongside a real public exchange-address tag list. Flags mixer/tumbler
patterns instead of silently misattributing through them.

This repo covers the backend/data/integration layers only — the frontend
visualization is being built separately (Antigravity).

## Layout

- `Blockchain/` — data layer: real GraphSense exchange tagpacks, Elliptic
  dataset loader (+ synthetic schema-compatible sample), live Blockchain.com
  on-chain client with disk caching. See `Blockchain/README.md`.
- `Backend/app/` — trace engine: NetworkX traversal (`traversal.py`),
  confidence scoring (`scoring.py`), mixer/tumbler detection (`mixer.py`),
  FastAPI app (`main.py`).
- `Integeration/pipeline.py` — orchestrates traversal + scoring into the
  `/trace` API response; `Integeration/tests/` holds the full-pipeline
  integration test.

## Setup

```
pip install -r requirements.txt
python -m Blockchain.gen_elliptic_sample   # one-time: generates the dev/test Elliptic-schema sample
```

## Run the API

```
uvicorn Backend.app.main:app --reload
```

```
POST /trace
{
  "wallet_address": "<btc address>",
  "max_hops": 4,
  "max_nodes": 150,
  "top_n": 10
}
```

Returns the traversal graph (`nodes`/`edges`) and a ranked `candidates` list,
each with `confidence`, `path`, `kind` (`direct_hit` | `heuristic`), and
`mixer_obscured`.

## Tests

```
pytest Backend Blockchain Integeration
```

26 tests: traversal bounds/hop-tracking, scoring rank order, mixer heuristic
detection, Blockchair fallback logic, and a full-pipeline integration test —
all run against deterministic mocked data, no live API calls required.
