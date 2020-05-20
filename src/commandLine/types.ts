import { ElementDataObject } from '../types/RokulRunnings';

export type configs = {
  ip: string;
  username: string;
  password: string;
  options?: rokuOptions;
  printOptions?: printer;
};

export type rokuOptions = {
  pressDelay?: number;
  retryDelay?: number;
  retries?: number;
};

export type printer = {
  true?: string;
  false?: string;
  jsonKey?: string;
  jsonValue?: jsonValueObject;
  jsonIndent?: number;
};

export type jsonValueObject = {
  string?: string;
  number?: string;
  boolean?: string;
};

export type opts = {
  data?: ElementDataObject;
  value?: string;
  using?: 'text' | 'tag' | 'attr';
  attribute?: string;
  [key: string]: string | ElementDataObject;
};
