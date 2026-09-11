"""Generates a small schema-compatible SYNTHETIC sample standing in for the
real Elliptic Bitcoin dataset (https://www.kaggle.com/datasets/ellipticco/elliptic-data-set).

The real dataset requires a Kaggle account/license and isn't redistributable
here. This script produces data with the exact same column schema (txId,
time step, 93 local + 72 aggregate anonymized features, class labels
1=illicit/2=licit/unknown, and a directed edge list) so the rest of the
pipeline can be developed and tested against the real thing later by
dropping elliptic_txs_features.csv / elliptic_txs_classes.csv /
elliptic_txs_edgelist.csv into Blockchain/data/elliptic/.

Run once: `python -m Blockchain.gen_elliptic_sample`
"""
from __future__ import annotations

import csv
import os
import random

OUT_DIR = os.path.join(os.path.dirname(__file__), "data", "elliptic_sample")
N_LOCAL_FEATURES = 93
N_AGG_FEATURES = 72
N_TIME_STEPS = 49


def _gen_features_row(rng: random.Random, is_licit_like: bool) -> list[float]:
    """Synthetic features loosely shaped so that 'licit, high in-degree'
    (exchange-deposit-proxy) transactions cluster distinctly from generic
    illicit/unknown ones -- enough signal for the scoring heuristic to be
    demonstrable against a real dataset's structure later."""
    base = rng.gauss(0.6, 0.15) if is_licit_like else rng.gauss(-0.2, 0.4)
    return [round(base + rng.gauss(0, 0.5), 6) for _ in range(N_LOCAL_FEATURES + N_AGG_FEATURES)]


def generate(n_tx: int = 2000, seed: int = 42) -> None:
    rng = random.Random(seed)
    os.makedirs(OUT_DIR, exist_ok=True)

    tx_ids = [100000 + i for i in range(n_tx)]
    classes: dict[int, str] = {}
    features_path = os.path.join(OUT_DIR, "elliptic_txs_features.csv")
    classes_path = os.path.join(OUT_DIR, "elliptic_txs_classes.csv")
    edgelist_path = os.path.join(OUT_DIR, "elliptic_txs_edgelist.csv")

    with open(features_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        header = ["txId", "time_step"] + [f"feat_{i}" for i in range(1, N_LOCAL_FEATURES + N_AGG_FEATURES + 1)]
        writer.writerow(header)
        for tx_id in tx_ids:
            roll = rng.random()
            if roll < 0.15:
                cls = "1"  # illicit
                is_licit_like = False
            elif roll < 0.75:
                cls = "2"  # licit
                is_licit_like = rng.random() < 0.3  # subset of licit that look like exchange deposits
            else:
                cls = "unknown"
                is_licit_like = False
            classes[tx_id] = cls
            time_step = rng.randint(1, N_TIME_STEPS)
            writer.writerow([tx_id, time_step] + _gen_features_row(rng, is_licit_like))

    with open(classes_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["txId", "class"])
        for tx_id in tx_ids:
            writer.writerow([tx_id, classes[tx_id]])

    with open(edgelist_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["txId1", "txId2"])
        for tx_id in tx_ids:
            # licit-looking, high-fan-in nodes get more inbound edges (deposit-consolidation proxy)
            n_out_edges = rng.randint(0, 3)
            for _ in range(n_out_edges):
                target = rng.choice(tx_ids)
                if target != tx_id:
                    writer.writerow([tx_id, target])

    print(f"Wrote synthetic Elliptic-schema sample ({n_tx} tx) to {OUT_DIR}")


if __name__ == "__main__":
    generate()
