import fs from 'node:fs';

const manifest = JSON.parse(
  fs.readFileSync('.output/chrome-mv3/manifest.json', 'utf8'),
);

if (manifest.manifest_version !== 3) {
  throw new Error(`Expected MV3, received ${manifest.manifest_version}`);
}

const permissions = [...(manifest.permissions ?? [])].sort();
if (JSON.stringify(permissions) !== JSON.stringify(['storage'])) {
  throw new Error(`Unexpected permissions: ${JSON.stringify(permissions)}`);
}

const hostPermissions = [...(manifest.host_permissions ?? [])].sort();
if (hostPermissions.length !== 0) {
  throw new Error(
    `Unexpected host_permissions: ${JSON.stringify(hostPermissions)}`,
  );
}

const matches = [
  ...new Set(
    (manifest.content_scripts ?? []).flatMap((script) => script.matches ?? []),
  ),
].sort();
const expectedMatches = ['http://*/*', 'https://*/*'].sort();
if (JSON.stringify(matches) !== JSON.stringify(expectedMatches)) {
  throw new Error(
    `Unexpected content-script matches: ${JSON.stringify(matches)}`,
  );
}

if (!manifest.action) {
  throw new Error('Toolbar action missing from manifest');
}
if (manifest.action.default_popup) {
  throw new Error('Toolbar action must not use a popup surface');
}

if (!manifest.options_ui?.page && !manifest.options_page) {
  throw new Error('Workspace entrypoint missing from manifest');
}
