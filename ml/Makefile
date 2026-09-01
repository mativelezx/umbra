# Umbra — Módulo ML propio
# Targets reproducibles. Equivalentes funcionalmente al pipeline DVC
# pero más simples para uso interactivo.

PYTHON := python3
SRC := src
DATA := data

.PHONY: help install prepare baseline train evaluate serve test clean all lint

help:
	@echo "Targets disponibles:"
	@echo "  make install   — pip install requirements"
	@echo "  make prepare   — generar splits train/val/test desde corpus"
	@echo "  make baseline  — Ridge sobre TF-IDF (baseline rápido)"
	@echo "  make train     — DistilBERT congelado + 5 Ridge multi-output"
	@echo "  make evaluate  — métricas MSE/R²/r por dimensión sobre test"
	@echo "  make serve     — FastAPI en localhost:8000"
	@echo "  make test      — pytest"
	@echo "  make all       — pipeline completo: prepare + baseline + train + evaluate"
	@echo "  make clean     — borrar mlruns, splits y métricas"
	@echo "  make lint      — chequeo rápido de imports rotos"

install:
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt

prepare:
	$(PYTHON) -m $(SRC).prepare_data

baseline:
	$(PYTHON) -m $(SRC).baseline_tfidf

train:
	$(PYTHON) -m $(SRC).train_ridge

evaluate:
	$(PYTHON) -m $(SRC).evaluate

serve:
	uvicorn $(SRC).api_server:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest -v

all: prepare baseline train evaluate

clean:
	rm -rf mlruns
	rm -rf $(DATA)/splits
	rm -f metrics.json metrics_baseline.json eval_metrics.json
	rm -f models/ridge_v1.joblib
	rm -f models/baseline_tfidf.joblib

lint:
	$(PYTHON) -c "import src.prepare_data, src.baseline_tfidf, src.train_ridge, src.evaluate, src.predict, src.api_server" && echo "imports OK"
