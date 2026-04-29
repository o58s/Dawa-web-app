


"""
Script to populate disease names in entity_indices.parquet
using the EBI OLS4 API with concurrent requests.

Run once:  python fix_disease_names.py
Resume:    python fix_disease_names.py   (picks up from cache)
"""

import pandas as pd
import requests
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

PARQUET_PATH = "artifacts/entity_indices.parquet"
CACHE_PATH   = "artifacts/disease_name_cache.json"
MAX_WORKERS  = 10          # concurrent API requests
SAVE_EVERY   = 500         # save cache every N resolutions


def resolve_name(entity_id: str) -> str:
    """Resolve a disease entity ID to its human-readable name via OLS4."""
    ols_id = entity_id.replace("_", ":")
    url = "https://www.ebi.ac.uk/ols4/api/search"
    params = {"q": ols_id, "exact": "true", "rows": 1}
    try:
        r = requests.get(url, params=params, timeout=15)
        if r.ok:
            docs = r.json().get("response", {}).get("docs", [])
            if docs:
                return docs[0].get("label", "")
    except Exception:
        pass
    return ""


def main():
    df = pd.read_parquet(PARQUET_PATH)
    disease_mask = df["entity_type"] == "disease"
    diseases = df.loc[disease_mask].copy()

    total = len(diseases)
    print(f"Total diseases: {total}")

    # Load cache
    cache = {}
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            cache = json.load(f)
        print(f"Loaded {len(cache)} cached names")

    # Find IDs that still need resolving
    to_resolve = []
    for _, row in diseases.iterrows():
        eid = row["entity_id"]
        if eid not in cache:
            to_resolve.append(eid)

    print(f"Need to resolve: {len(to_resolve)}")

    if to_resolve:
        resolved_count = 0
        failed_count = 0
        start = time.time()

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(resolve_name, eid): eid for eid in to_resolve}
            for future in as_completed(futures):
                eid = futures[future]
                try:
                    name = future.result()
                except Exception:
                    name = ""

                cache[eid] = name
                if name:
                    resolved_count += 1
                else:
                    failed_count += 1

                done = resolved_count + failed_count
                if done % 100 == 0:
                    elapsed = time.time() - start
                    rate = done / elapsed if elapsed > 0 else 0
                    remaining = (len(to_resolve) - done) / rate if rate > 0 else 0
                    print(f"  [{done}/{len(to_resolve)}] "
                          f"resolved={resolved_count} failed={failed_count} "
                          f"rate={rate:.1f}/s ETA={remaining/60:.1f}min")

                if done % SAVE_EVERY == 0:
                    with open(CACHE_PATH, "w", encoding="utf-8") as f:
                        json.dump(cache, f, ensure_ascii=False)

        # Final cache save
        with open(CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False)

        print(f"\nResolution complete: {resolved_count} resolved, {failed_count} failed")

    # Apply cached names to dataframe
    for idx, row in diseases.iterrows():
        eid = row["entity_id"]
        if eid in cache and cache[eid]:
            df.at[idx, "name"] = cache[eid]

    # Save updated parquet
    df.to_parquet(PARQUET_PATH, index=False)
    
    # Verify
    updated = df.loc[disease_mask]
    filled = (updated["name"] != "").sum()
    print(f"\nParquet updated! {filled}/{total} diseases now have names.")


if __name__ == "__main__":
    main()
