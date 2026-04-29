# 🧬 Dawa.ae — Drug Repurposing Prediction Platform

> An AI-powered platform that predicts new therapeutic uses for existing drugs using graph-based machine learning and molecular embeddings.

---

## 📌 Overview

**Dawa.ae** is a graduation project built to tackle one of the most expensive bottlenecks in medicine — drug development. Instead of discovering entirely new compounds from scratch, Dawa.ae leverages machine learning to identify existing, already-approved drugs that may be effective against diseases they were never originally designed to treat.

The platform combines a **Variational Autoencoder (VAE)** for drug embedding, a **Link Prediction neural network** for drug–disease scoring, and a clean **React + Flask** full-stack interface that lets users search any drug and instantly see ranked disease candidates with confidence scores.

---

## 🧠 How It Works

```
User inputs drug name
        ↓
Flask /predict endpoint
        ↓
Predictor loads pre-trained embeddings (drug + disease)
        ↓
LinkPredictor scores all drug–disease pairs
        ↓
Top-K results ranked by logit score, normalized 0–1
        ↓
Results displayed in frontend with score distribution
```

The ML pipeline uses:
- **DrugVAE** — encodes drug molecular features into a 128-dim latent space
- **LinkPredictor** — takes concatenated drug + disease embeddings and outputs a repurposing confidence logit
- **Per-query normalization** — scores are normalized relative to each drug's own logit distribution, ensuring meaningful spread in the results

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-CORS |
| Database | PostgreSQL (via pgAdmin) |
| ML / AI | PyTorch, NumPy, Pandas, SciPy |
| Embeddings | Pre-trained DrugVAE + LinkPredictor |
| Disease Naming | EBI OLS4 API (concurrent resolution) |
| Frontend | React 18 (Babel standalone), plain CSS |
| Data Format | Parquet, NPY, JSON cache |

---

## 🗃️ Database Schema

The PostgreSQL database (`Dawa`) consists of 6 core tables:

- **users** — registered accounts with role-based access
- **drugs** — compound info (SMILES, formula, molecular weight, status)
- **diseases** — disease registry with ICD codes
- **proteins** — protein targets (UniProt ID, gene name, sequence)
- **search_history** — logs every user query with timestamp
- **predictions** — stores model outputs linked to drug, disease, protein, and the triggering search

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user |
| POST | `/predict` | **Core endpoint** — run drug repurposing prediction |
| POST | `/add_drug` | Add a drug to the database |
| POST | `/add_disease` | Add a disease to the database |
| POST | `/add_protein` | Add a protein to the database |
| POST | `/search` | Log a search history entry |

### Example — `/predict`

```json
// Request
POST /predict
{
  "drug_name": "Metformin",
  "top_k": 20
}

// Response
{
  "drug": "Metformin",
  "search_id": null,
  "predictions": [
    {
      "disease_id": "MONDO_0005148",
      "disease_name": "type 2 diabetes mellitus",
      "score": 0.9821,
      "raw_score": 0.9134,
      "logit": 2.354,
      "rank": 1
    },
    ...
  ]
}
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.9+
- PostgreSQL running locally
- Node not required (frontend uses Babel CDN)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/dawa.ae.git
cd dawa.ae

# 2. Install dependencies
pip install flask flask-sqlalchemy flask-cors torch numpy pandas scipy pyarrow requests

# 3. Set up the database
# Create a PostgreSQL DB named "Dawa" and update credentials in database.py

# 4. Place model artifacts in /artifacts/
#    (best_classifier.pt, drug_embeddings.npy, disease_embeddings.npy, entity_indices.parquet)

# 5. Run the backend
python app.py

# 6. Open the frontend
# Open frontend/Dawa.html directly in a browser
# Make sure API_BASE in Dawa.html points to http://localhost:5000
```

---

## 👨‍💻 My Role

I built the **full backend** for this project as part of my graduation work at the University of Sharjah.

This included:

- **Database design** — Designed and implemented the 6-table PostgreSQL schema in pgAdmin, modeling the relationships between users, drugs, diseases, proteins, searches, and predictions
- **Flask API** — Built all RESTful endpoints using Flask Blueprints, organized by resource (auth, drug, disease, protein, search, prediction)
- **ML integration** — Wired the pre-trained PyTorch model (`predictor.py`) into the `/predict` Flask endpoint, handling embedding lookup, inference, score normalization, and result formatting
- **Data pipeline** — Worked with the `fix_disease_names.py` utility to resolve ~thousands of raw disease ontology IDs to human-readable names via the EBI OLS4 API using concurrent threading
- **Frontend connection** — Ensured the React frontend connects cleanly to the Flask backend with CORS configured, and that prediction results are shaped correctly for the Results component

---

## 📄 License

This project was developed as a graduation project at the **University of Sharjah**. All rights reserved.

---

*Built with Flask, PyTorch, and PostgreSQL · Dawa.ae © 2025*
