import sys
import hashlib
import json
from pathlib import Path

PLUGIN_NAME = 'openai-translator'
RELEASE_DIR = Path('release')


def update_appcast(version, desc):
    release_file = RELEASE_DIR / f'{PLUGIN_NAME}-{version}.bobplugin'
    assert release_file.is_file(), 'Release file not exist'
    with open(release_file, 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    version_info = {
        'version': version,
        'desc': desc,
        'sha256': file_hash,
        'url': (
            'https://github.com/jtsang4/bob-plugin-openaiapi/releases/download/'
            f'v{version}/{release_file.name}'
        ),
        'minBobVersion': '1.8.0',
    }
    appcast_file = Path('appcast.json')
    if appcast_file.is_file():
        with open(appcast_file, 'r') as f:
            appcast = json.load(f)
    else:
        appcast = dict(identifier='openai.translator', versions=[])
    appcast['versions'].insert(0, version_info)
    with open(appcast_file, 'w') as f:
        json.dump(appcast, f, ensure_ascii=False, indent=2)


def update_info_json(version):
    info_file = Path('src/info.json')
    with open(info_file, 'r') as f:
        info = json.load(f)
    info['version'] = version
    with open(info_file, 'w') as f:
        json.dump(info, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    version = sys.argv[1]
    desc = sys.argv[2]
    RELEASE_DIR.mkdir(exist_ok=True)
    update_appcast(version, desc)
    update_info_json(version)
