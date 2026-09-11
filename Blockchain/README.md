# Blockchain (data layer)

Provides the data the trace engine consumes:

- `tag_list.py` — loads real public exchange-address tag packs (GraphSense
  format) from `data/tagpacks/*.yaml` into an `address -> exchange` lookup.
  A curated, size-trimmed set of real BTC exchange tagpacks (Binance,
  Bitfinex, BitMEX, Bybit, Crypto.com, Deribit, Huobi, KuCoin, OKX — 3.5k+
  addresses) ships in this repo. Drop in more `.yaml` files from
  https://github.com/graphsense/graphsense-tagpacks/tree/master/packs to
  extend coverage.

- `elliptic.py` — loads the **real Elliptic Bitcoin dataset**'s graph
  structure (203,769 transactions, 234,355 edges) and derives a topology
  signature (`ExchangeSignature`) for exchange-deposit-like behaviour, used
  as a scoring reference. The real dataset requires a Kaggle
  account/license (https://www.kaggle.com/datasets/ellipticco/elliptic-data-set),
  so it is **not committed to git** (689MB, non-redistributable license,
  ignored via `.gitignore`) — each environment needs its own copy of
  `elliptic_txs_features.csv`, `elliptic_txs_classes.csv`,
  `elliptic_txs_edgelist.csv` dropped into `data/elliptic/`. Only
  `elliptic_txs_classes.csv` and `elliptic_txs_edgelist.csv` are actually
  read (the loader uses graph topology, not the anonymized per-tx feature
  vectors in `elliptic_txs_features.csv`). `gen_elliptic_sample.py`
  generates a small schema-compatible synthetic fallback
  (`data/elliptic_sample/`) used automatically if the real files aren't
  present.

- `client/onchain.py` — live Blockchain.com (`blockchain.info`) API client
  fetching real on-chain transactions for an address, with disk caching
  (`client/cache.py`) under `data/cache/` to stay within free-tier rate
  limits across repeated demo runs. Primary data source.

- `client/blockchair.py` — Blockchair API fallback, used automatically when
  Blockchain.com fails or is rate-limited. Lists an address' spending
  transactions (`transaction_details=true`, filtered to `balance_change <
  0`), then fetches each tx's full input/output detail to resolve
  destination addresses. **Implemented, not live-validated** — Blockchair
  returns HTTP 430 ("temporary blacklisted due to exceeding usage of API
  resources") on every attempt so far, confirmed both from the dev sandbox
  and from a separate real machine, so it's Blockchair's shared free-tier
  pool being saturated rather than anything specific to this code or
  network. Getting a working key requires contacting Blockchair directly
  (info@blockchair.com); deliberately not pursued to avoid a paid plan.
  Covered by unit tests against mocked responses shaped like the documented
  schema (`tests/test_blockchair.py`); re-verify against a live call if a
  working key or unblocked IP becomes available later.

- `hops.py` — `get_next_hops(address)`: the single entry point the Backend
  traversal engine calls. Tries Blockchain.com first, falls back to
  Blockchair on failure, and annotates each destination with a tag-list hit
  if one exists.

## Setup

```
pip install -r requirements.txt

# Real Elliptic dataset (recommended): download from Kaggle (requires account +
# accepting the dataset's terms) and drop the 3 CSVs into data/elliptic/.
# https://www.kaggle.com/datasets/ellipticco/elliptic-data-set

# OR, if you don't have the real dataset yet, generate the synthetic fallback:
python -m Blockchain.gen_elliptic_sample
```
