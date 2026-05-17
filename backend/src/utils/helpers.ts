import { Request } from 'express';

export const getId = (req: Request): string => {
  return req.params.id as string;
};

export const getParam = (req: Request, param: string): string => {
  return req.params[param] as string;
};

export const getQuery = (req: Request, param: string): string | undefined => {
  const value = req.query[param];
  return (Array.isArray(value) ? value[0] : value) as string | undefined;
};

export const getQueryInt = (req: Request, param: string, defaultValue: number): number => {
  const value = getQuery(req, param);
  if (!value) return defaultValue;
  return parseInt(value, 10);
};
