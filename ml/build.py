"""Bundle the exact frozen extractor for inference, never training or user data."""
from pathlib import Path

from huggingface_hub import snapshot_download
from src.extract_embeddings import MODEL_NAME, MODEL_REVISION


def main():
    snapshot_download(
        repo_id=MODEL_NAME,
        revision=MODEL_REVISION,
        local_dir=Path(__file__).parent / "models" / "distilbert",
        allow_patterns=["config.json", "tokenizer_config.json", "tokenizer.json",
                        "vocab.txt", "special_tokens_map.json", "model.safetensors"],
    )


if __name__ == "__main__":
    main()
