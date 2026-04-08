import { ComponentType, LazyExoticComponent } from 'react';

export interface RouterItem {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
  title?: string;
  meta?: {
    requiresAuth?: boolean;
    title?: string;
    [key: string]: any;
  };
}
