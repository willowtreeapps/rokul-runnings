export type ElementDataObject = { value: string } & (
  | {
      using: 'text' | 'tag';
    }
  | {
      using: 'attr';
      attribute: string;
    }
);

export type Apps = {
  [key: string]: {
    id: string;
    subtype: string;
    type: string;
    version: string;
  };
};

export type XMLAttributes = {
  bounds?: bounds | string;
  children?: number | string;
  color?: string | string;
  count?: string | number;
  error?: string;
  extends?: string;
  focusable?: boolean | string;
  focused?: boolean | string;
  focusItem?: number | string;
  index?: number | string;
  loadStatus?: number | string;
  opacity?: number | string;
  state?: string;
  text?: string;
  uri?: string;
  visible?: boolean | string;
  [key: string]: string | bounds | number | boolean;
};

export type bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlayerInfoResponse = {
  player: {
    attributes: XMLAttributes;
    duration: string | number;
    position: string | number;
    [key: string]: string | number | object;
  };
};

export interface AppUIResponseInterface {
  [key: string]: AppUIResponseInterface | AppUIResponseInterface[];
}

export type AppUIResponseObject = {
  attributes: XMLAttributes;
} & AppUIResponseInterface;

export type SquashedAppUIObject = {
  [key: string]: {
    [key: string]: string;
  };
};

export declare type Action = 'Install' | 'Replace' | 'Delete' | 'Screenshot';
export declare type Method = 'GET' | 'POST';

export type Params = {
  [key: string]: string;
};
