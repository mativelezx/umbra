"""Execute this notebook's plain Python cells sequentially, without a Jupyter kernel.

Only basic structure is checked; this is not nbformat schema certification.
This runner is for the inspected, local companion notebook, not untrusted files.
"""
from contextlib import redirect_stdout, redirect_stderr
from datetime import datetime, timezone
import io
import json
from pathlib import Path


def main():
    path = Path(__file__).resolve().parent/"revision.ipynb"
    notebook = json.loads(path.read_text())
    assert notebook["nbformat"] == 4 and notebook["nbformat_minor"] == 5
    assert isinstance(notebook["metadata"], dict)
    namespace, count, ids = {"__name__": "__notebook__"}, 0, set()
    for cell in notebook["cells"]:
        assert cell["cell_type"] in ("markdown", "code")
        assert isinstance(cell["metadata"], dict) and cell["id"] not in ids
        ids.add(cell["id"])
        assert isinstance(cell["source"], list) and all(isinstance(s, str) for s in cell["source"])
        if cell["cell_type"] != "code":
            continue
        count += 1
        output = io.StringIO()
        with redirect_stdout(output), redirect_stderr(output):
            exec(compile("".join(cell["source"]), f"{path.name}:cell-{count}", "exec"), namespace)
        cell["execution_count"] = count
        cell["outputs"] = [{"output_type": "stream", "name": "stdout", "text": output.getvalue().splitlines(keepends=True)}]
        print(output.getvalue(), end="")
    notebook["metadata"]["umbra_execution"] = {
        "mode": "sequential_python_not_jupyter_kernel", "code_cells": count,
        "completed_at": datetime.now(timezone.utc).isoformat(), "passed": True,
        "structure_validation": "basic_fields_only_not_nbformat_schema"}
    path.write_text(json.dumps(notebook, indent=1, ensure_ascii=False, allow_nan=False) + "\n")
    print(f"Executed {count} Python cells sequentially; no Jupyter kernel used.")


if __name__ == "__main__":
    main()
