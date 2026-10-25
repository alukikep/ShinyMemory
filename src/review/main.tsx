import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import './review.css';
import { ReviewApp } from './ReviewApp';

const root = document.getElementById('review-root');
if (!root) throw new Error('review root not found');

createRoot(root).render(
  <StrictMode>
    <ReviewApp />
  </StrictMode>,
);
