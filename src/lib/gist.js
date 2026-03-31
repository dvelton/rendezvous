import { execSync } from 'node:child_process';

export function createGist(filename, content, description) {
  const result = execSync(
    `gh gist create -f "${filename}" -d "${description.replace(/"/g, '\\"')}"`,
    { input: content, encoding: 'utf-8' }
  );
  return result.trim();
}

export function getGist(gistId) {
  const result = execSync(
    `gh api gists/${gistId}`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(result);
}

export function getGistComments(gistId) {
  const result = execSync(
    `gh api gists/${gistId}/comments --paginate`,
    { encoding: 'utf-8' }
  );
  const comments = JSON.parse(result);
  return comments.map((c) => ({
    id: c.id,
    user: c.user.login,
    body: c.body,
    createdAt: c.created_at,
  }));
}

export function postGistComment(gistId, body) {
  execSync(
    `gh api gists/${gistId}/comments -f body="${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
    { encoding: 'utf-8' }
  );
}

export function postGistCommentRaw(gistId, body) {
  const payload = JSON.stringify({ body });
  execSync(
    `gh api gists/${gistId}/comments --input -`,
    { input: payload, encoding: 'utf-8' }
  );
}

export function parseGistUrl(urlOrId) {
  if (!urlOrId.includes('/')) {
    return urlOrId;
  }
  const match = urlOrId.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/);
  if (match) return match[1];

  const parts = urlOrId.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

export function getGistTopic(gist) {
  const files = Object.values(gist.files);
  if (files.length === 0) return 'Unknown topic';
  const content = files[0].content || '';
  const match = content.match(/^# Rendezvous: (.+)$/m);
  return match ? match[1] : gist.description || 'Unknown topic';
}
