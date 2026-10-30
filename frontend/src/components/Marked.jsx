import React from 'react';
import { escapeRe } from '../lib/role';

export default function Marked({ text, kws = [] }) {
  if (!text) return text;
  const str = String(text);
  if (!kws || kws.length === 0) {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return str;
    const res = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        res.push(React.createElement('strong', { key: i }, parts[i]));
      } else if (parts[i]) {
        res.push(parts[i]);
      }
    }
    return res.length === 1 ? res[0] : res;
  }
  const boldParts = str.split(/\*\*([^*]+)\*\*/g);
  if (boldParts.length === 1) {
    const pattern = '(' + kws.map(escapeRe).join('|') + ')';
    const parts = str.split(new RegExp(pattern, 'ig'));
    const res = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2) {
        res.push(React.createElement('mark', { key: i, className: 'kw' }, parts[i]));
      } else {
        res.push(parts[i]);
      }
    }
    return res;
  }
  const result = [];
  for (let idx = 0; idx < boldParts.length; idx++) {
    const part = boldParts[idx];
    if (idx % 2 === 1) {
      const pattern = '(' + kws.map(escapeRe).join('|') + ')';
      const parts = part.split(new RegExp(pattern, 'ig'));
      const inner = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2) {
          inner.push(React.createElement('mark', { key: i, className: 'kw' }, parts[i]));
        } else {
          inner.push(parts[i]);
        }
      }
      result.push(React.createElement('strong', { key: idx }, inner));
    } else if (part) {
      const pattern = '(' + kws.map(escapeRe).join('|') + ')';
      const parts = part.split(new RegExp(pattern, 'ig'));
      for (let i = 0; i < parts.length; i++) {
        if (i % 2) {
          result.push(React.createElement('mark', { key: idx + '-' + i, className: 'kw' }, parts[i]));
        } else {
          result.push(parts[i]);
        }
      }
    }
  }
  return result;
}
