"""Generated media kept as source archives; instruction checks live in pedagogy.py."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'lesson-films.json').read_text())
assert len(data['lessons'])==48
assert len(data['clips'])==19
for clip in data['clips'].values():
 for name in ['video','poster']:
  assert not clip[name].startswith('http'),clip[name]
  assert (root/clip[name]).stat().st_size>1000,clip[name]
print('PASS: 19 generated source clips and posters remain local; use tests/pedagogy.py for the active teaching experience.')
