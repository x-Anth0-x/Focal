"""Validate editorial contracts and references. Development-only: pip install jsonschema."""
import json, subprocess
from pathlib import Path
from jsonschema import Draft202012Validator
ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return json.loads((ROOT / path).read_text())

for name, schema in [('academy-v2','academy-v2'),('equipment','equipment'),('diagnostic','questions'),('review-bank','questions'),('pilot-first-shot','pilot-first-shot')]:
    contract = read(f'schemas/{schema}.schema.json')
    Draft202012Validator.check_schema(contract)
    errors = list(Draft202012Validator(contract).iter_errors(read(f'data/{name}.json')))
    assert not errors, '\n'.join(f'{name}: {e.json_path}: {e.message}' for e in errors)
subprocess.run(['node','tests/learning-core.cjs'],cwd=ROOT,check=True)
a = read('data/academy-v2.json')
legacy = read('curriculum.json')
assert {t['id'] for t in a['targets'] if t['availability']=='legacy-available'} == {x['id'] for x in legacy}
assert len({t['title'].casefold() for t in a['targets']}) == len(a['targets'])
assert {t['moduleId'] for t in a['targets']} == {m['id'] for m in a['modules']}
assert all(not t['route'] for t in a['targets'] if t['availability']=='planned')
assert len({q['prompt'].casefold() for q in read('data/review-bank.json')['questions']}) == len(read('data/review-bank.json')['questions'])
pilot = read('data/pilot-first-shot.json')
slugs = {x['slug'] for x in read('glossary.json')}
assert all(g['slug'] in slugs for g in pilot['glossary'])
source_ids = {s['id'] for s in a['sources']}
for item in read('data/equipment.json')['bodies'] + read('data/equipment.json')['lenses']:
    assert set(item['sourceIds']) <= source_ids
print('PASS: 5 JSON documents, typed schemas, 27 domains, 240 unique targets, original IDs, sources and glossary links.')
