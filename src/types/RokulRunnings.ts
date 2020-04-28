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
  text?: string;
  error?: string;
  state?: string;
  name?: string;
  [key: string]: string;
};

export type Params = {
  [key: string]: string | number;
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
