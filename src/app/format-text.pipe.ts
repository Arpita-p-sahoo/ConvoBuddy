import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const copyIconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

marked.use({
  renderer: {
    code({ text, lang }: Tokens.Code): string {
      const language = (lang || 'text').trim().split(/\s+/)[0] || 'text';
      const escaped = escapeHtml(text);
      return `<div class="code-block">
        <div class="code-block__header">
          <span class="code-block__lang">${escapeHtml(language)}</span>
          <button type="button" class="code-block__copy" aria-label="Copy code">
            ${copyIconSvg}<span>Copy</span>
          </button>
        </div>
        <pre><code class="language-${escapeHtml(language)}">${escaped}</code></pre>
      </div>`;
    },
    link({ href, title, text }: Tokens.Link): string {
      const safeHref = href || '#';
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    },
    image({ href, title, text }: Tokens.Image): string {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(href || '')}" alt="${escapeHtml(text || '')}"${titleAttr} class="chat-image" loading="lazy" />`;
    },
  },
});

marked.setOptions({
  breaks: true,
  gfm: true,
});

@Pipe({
  name: 'formatText',
})
export class FormatTextPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    const rawHtml = marked.parse(value, { async: false }) as string;
    const clean = DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel', 'loading'],
    });

    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
