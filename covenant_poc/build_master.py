"""Rebuild master_data.json from POC template.xlsx (Covenant Matrix sheet)."""

from __future__ import annotations

import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
XLSX = Path("/workspace/attachments/POC template.xlsx")
OUT = Path(__file__).resolve().parent / "data" / "master_data.json"
REACT_OUT = Path("/workspace/src/data/master-data.json")


def _col_row(cell_ref: str) -> tuple[int, int]:
    m = re.match(r"([A-Z]+)(\d+)", cell_ref)
    if not m:
        raise ValueError(cell_ref)
    col, row = m.group(1), int(m.group(2))
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n - 1, row


def main() -> None:
    with zipfile.ZipFile(XLSX) as z:
        ss_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        strings = []
        for si in ss_root.findall("m:si", NS):
            texts = [t.text or "" for t in si.findall(".//m:t", NS)]
            strings.append("".join(texts))

        root = ET.fromstring(z.read("xl/worksheets/sheet2.xml"))
        rows: dict[int, dict[int, str]] = defaultdict(dict)
        max_col = max_row = 0
        for c in root.findall(".//m:c", NS):
            ref = c.get("r")
            if not ref:
                continue
            col, row = _col_row(ref)
            t = c.get("t")
            v = c.find("m:v", NS)
            is_el = c.find("m:is", NS)
            val = None
            if t == "s" and v is not None and v.text:
                val = strings[int(v.text)]
            elif t == "inlineStr" and is_el is not None:
                val = "".join((tt.text or "") for tt in is_el.findall(".//m:t", NS))
            elif v is not None:
                val = v.text
            if val is not None:
                rows[row][col] = val
                max_col = max(max_col, col)
                max_row = max(max_row, row)

    records = []
    for i, r in enumerate(range(2, max_row + 1), start=1):
        row = [rows[r].get(c, "") for c in range(0, max_col + 1)]
        subtype = (row[0] if row else "").strip()
        if not subtype:
            continue
        kw_raw = (row[11] if len(row) > 11 else "").strip()
        keywords = [k.strip() for k in re.split(r"[,;]", kw_raw) if k.strip()]
        records.append(
            {
                "id": f"COV-{i:03d}",
                "subtype": subtype,
                "category": (row[1] if len(row) > 1 else "").strip(),
                "covenantType": (row[2] if len(row) > 2 else "").strip(),
                "nature": (row[3] if len(row) > 3 else "").strip(),
                "criticality": (row[4] if len(row) > 4 else "").strip(),
                "attachment": (row[5] if len(row) > 5 else "").strip(),
                "documentRequired": (row[6] if len(row) > 6 else "").strip(),
                "attachmentGroup": (row[7] if len(row) > 7 else "").strip(),
                "assignedTo": (row[8] if len(row) > 8 else "").strip(),
                "maker": (row[9] if len(row) > 9 else "").strip(),
                "checker": (row[10] if len(row) > 10 else "").strip(),
                "keywords": keywords,
                "keywordsRaw": kw_raw,
            }
        )

    payload = {
        "sourceSheet": "Covenant Matrix",
        "sourceFile": "POC template.xlsx",
        "count": len(records),
        "covenants": records,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    if REACT_OUT.parent.exists():
        REACT_OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(records)} covenants to {OUT}")


if __name__ == "__main__":
    main()
