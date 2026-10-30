import json
path = 'src/data/resume.fallback.json'
with open(path) as f:
    data = json.load(f)
# Rebuild cleanly
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
print('ok')
