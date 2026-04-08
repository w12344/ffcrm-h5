import { memo } from 'react';

// SVG 图标组件 - 使用 memo 优化性能
export const BasicInfoIcon = memo(() => (
  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 16C6 14.3431 7.34315 13 9 13C10.6569 13 12 14.3431 12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="15" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="15" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
));

export const TimelineIcon = memo(() => (
  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 4L22 7L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

export const AISummaryIcon = memo(() => (
  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
    <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
    <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
    <circle cx="19" cy="18" r="1" fill="currentColor"/>
  </svg>
));

export const IssuesIcon = memo(() => (
  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 6V12C4 17 7 21 12 22C17 21 20 17 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
  </svg>
));

export const ContactsIcon = memo(() => (
  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 18C3 15.2386 5.23858 13 8 13H10C12.7614 13 15 15.2386 15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 18C20.2091 18 22 16.2091 22 14C22 13 21.5 12.5 21 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
));

export const ContractIcon = memo(() => (
  <svg className="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
));

BasicInfoIcon.displayName = 'BasicInfoIcon';
TimelineIcon.displayName = 'TimelineIcon';
AISummaryIcon.displayName = 'AISummaryIcon';
IssuesIcon.displayName = 'IssuesIcon';
ContactsIcon.displayName = 'ContactsIcon';
ContractIcon.displayName = 'ContractIcon';
