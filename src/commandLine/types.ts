import { ElementDataObject } from '../types/RokulRunnings';

export type configs = {
  ip: string;
  username: string;
  password: string;
  options?: rokuOptions;
  printOptions?: printer;
};

export type rokuOptions = {
  pressDelayInMillis?: number;
  retryDelayInMillis?: number;
  retries?: number;
};

export type printer = {
  trueStyle?: string;
  falseStyle?: string;
  jsonKeyStyle?: string;
  jsonValueStyle?: jsonValueObject;
  jsonIndentAmount?: number;
};

export type jsonValueObject = {
  stringStyle?: string;
  numberStyle?: string;
  booleanStyle?: string;
};

export type opts = {
  [key: string]: string | ElementDataObject;
  data?: ElementDataObject;
  value?: string;
  using?: 'text' | 'tag' | 'attr';
  attribute?: string;
};
