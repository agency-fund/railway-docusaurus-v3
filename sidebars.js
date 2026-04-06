const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const sidebars = buildSidebars();

function buildSidebars() {
  const navPath = join(__dirname, 'navigation.json');
  const tabs = JSON.parse(readFileSync(navPath, 'utf-8'));
  const result = {};
  for (const tab of tabs) {
    const sidebarId = slugify(tab.label);
    result[sidebarId] = convertChildren(tab.children || [], tab.path);
  }
  return result;
}

function convertChildren(children, tabPath) {
  return children.map(node => convertNode(node, tabPath)).filter(Boolean);
}

function convertNode(node, tabPath) {
  switch (node.type) {
    case 'page':
      return {
        type: 'doc',
        id: stripPrefix(stripExtension(node.path), tabPath),
        label: node.label,
      };
    case 'link':
      return {
        type: 'link',
        label: node.label,
        href: node.url,
      };
    case 'folder':
    case 'group':
      return {
        type: 'category',
        label: node.label,
        items: convertChildren(node.children || [], tabPath),
      };
    default:
      return null;
  }
}

function stripExtension(path) {
  return path.replace(/\.[^/.]+$/, '');
}

function stripPrefix(path, prefix) {
  if (!prefix) return path;
  const p = prefix.endsWith('/') ? prefix : prefix + '/';
  return path.startsWith(p) ? path.slice(p.length) : path;
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

module.exports = sidebars;