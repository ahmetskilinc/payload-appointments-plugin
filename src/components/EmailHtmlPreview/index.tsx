'use client';

import { useDocumentInfo } from '@payloadcms/ui';
import React, { useState } from 'react';

import './styles.scss';

type SentEmailDoc = {
  html?: string;
};

export default function EmailHtmlPreview() {
  const { initialData } = useDocumentInfo();
  const [isExpanded, setIsExpanded] = useState(true);
  const doc = initialData as SentEmailDoc | undefined;

  if (!doc?.html) {
    return (
      <div className="email-html-preview">
        <div className="email-html-preview__empty">No HTML content available</div>
      </div>
    );
  }

  return (
    <div className="email-html-preview">
      <div className="email-html-preview__header">
        <h4 className="email-html-preview__title">Email Preview</h4>
        <button
          type="button"
          className="email-html-preview__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {isExpanded && (
        <div className="email-html-preview__container">
          <iframe
            className="email-html-preview__iframe"
            srcDoc={doc.html}
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
