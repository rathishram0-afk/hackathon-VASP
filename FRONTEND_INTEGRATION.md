# Frontend integration guide

Backend is complete and live-validated. This is the contract the frontend
(built separately, Antigravity) integrates against.

## Running the backend locally

```
pip install -r requirements.txt
python -m Blockchain.gen_elliptic_sample   # one-time, if not already generated
uvicorn Backend.app.main:app --reload
```

Serves on `http://127.0.0.1:8000` by default. Interactive API docs (Swagger
UI) at `http://127.0.0.1:8000/docs`, raw OpenAPI schema at
`http://127.0.0.1:8000/openapi.json`.

CORS is open to all origins/methods (`Access-Control-Allow-Origin: *`), so
the frontend dev server can call it from any port with no proxy config
needed.

## Endpoints

### `GET /health`

```json
{ "status": "ok" }
```

### `POST /trace`

**Request:**
```json
{
  "wallet_address": "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX",
  "max_hops": 4,
  "max_nodes": 150,
  "top_n": 10
}
```
- `wallet_address` (required): a BTC address (legacy, P2SH, or bech32), 20-100 chars.
- `max_hops` (optional, default 4, 1-8): how many hops outward to walk.
- `max_nodes` (optional, default 150, 1-500): total node budget for the trace (bounds live API calls).
- `top_n` (optional, default 10, 1-50): max candidates to return.

**Response:**
```json
{
  "source": "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX",
  "truncated": false,
  "graph": {
    "nodes": [
      {
        "address": "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX",
        "hop_distance": 0,
        "tag": null
      },
      {
        "address": "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s",
        "hop_distance": 2,
        "tag": { "exchange": "binance", "label": "binance.com" }
      }
    ],
    "edges": [
      {
        "src": "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX",
        "dst": "1CRLGcaXajtWVF5EopZgQUqE12dKn8Rtuh",
        "tx_hash": "fa96bce25dc...",
        "value_btc": 0.05,
        "timestamp": 1700000000
      }
    ]
  },
  "candidates": [
    {
      "exchange": "binance",
      "address": "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s",
      "confidence": 0.96,
      "hop_distance": 2,
      "path": ["3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX", "1CRLGcaXajtWVF5EopZgQUqE12dKn8Rtuh", "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s"],
      "kind": "direct_hit",
      "mixer_obscured": false
    },
    {
      "exchange": null,
      "address": "some_untagged_address",
      "confidence": 0.42,
      "hop_distance": 3,
      "path": ["...", "..."],
      "kind": "heuristic",
      "mixer_obscured": true
    }
  ]
}
```

### Field notes for the UI

- **`graph`** is exactly what the "traversal view" should render: `nodes`
  (with `hop_distance` for radial/hierarchical layout, and `tag` set only
  on directly-tagged exchange addresses — style these distinctly) and
  `edges` (with `value_btc`/`timestamp`/`tx_hash` for edge labels/tooltips).
- **`candidates`** is the ranked panel. Sorted by `confidence` descending
  already (no client-side re-sort needed).
  - `kind: "direct_hit"` — the trail led directly to a tagged exchange
    address. `exchange` is set.
  - `kind: "heuristic"` — no tag found within the hop budget; `exchange` is
    `null`, `address` is the best-guess candidate node, ranked by proximity
    + pattern resemblance to known exchange-deposit topology.
  - `mixer_obscured: true` — the path to this candidate passed through a
    node flagged as mixer/tumbler-like. **Surface this as a visible
    warning badge**, not just a lower number — the point of this flag
    (a stretch goal from the problem statement) is to make clear the
    confidence score is unreliable here, not just lower.
  - Clicking a candidate should highlight `path` in the graph view.
- **`truncated: true`** means the node/hop budget was hit before the
  frontier was fully exhausted — worth a small "trace was bounded, results
  may be incomplete" indicator in the UI.

### Error responses

- `422` — invalid request body (e.g. bad `wallet_address` length) — FastAPI's standard validation error shape.
- `502` — both on-chain data providers failed for some part of the trace (rare; primary provider is Blockchain.com, live-validated and reliable in testing).

## Known limitations (non-blocking)

- Blockchair (secondary on-chain data provider, automatic fallback if
  Blockchain.com fails) is implemented but not live-validated — see
  `Blockchain/README.md`. Doesn't affect the API contract or frontend at
  all; it's an internal resilience detail.
- Elliptic dataset backing the scoring heuristic is a synthetic
  schema-compatible sample by default (real dataset requires a Kaggle
  license) — doesn't change the API shape, just the specific confidence
  numbers you'll see until the real dataset is dropped in.
