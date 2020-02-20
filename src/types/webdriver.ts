export type sessionsResponse = {
  sessionId: string;
  status: number;
  value: deviceInfoValue;
};

export type getPlayerInfoResponse = {
  sessionId: string;
  status: number;
  value: {
    Error: string;
    State: string;
    Format: {
      Audio: string;
      Captions: string;
      Container: string;
      Drm: string;
      Video: string;
      VideoRes: string;
    };
    Buffering: {
      Current: string;
      Max: string;
      Target: string;
    };
    NewStream: {
      Speed: string;
    };
    Position: string | number;
    Duration: string | number;
    IsLive: string;
    Runtime: string;
    StreamSegment: {
      Bitrate: string;
      MediaSequence: string;
      SegmentType: string;
      Time: string;
    };
  };
};

export type appResponse = {
  Title: string;
  ID: string;
  Type: string;
  Version: string;
  Subtype: string;
};

export type getCurrentAppResponse = {
  sessionId: string;
  status: string;
  value: appResponse;
};

export type getAllAppsResponse = {
  sessionId: string;
  status: string;
  value: appResponse[];
};

export type getScreenSourceResponse = {
  sessionId: string;
  status: string;
  value: string;
};

export type nullValueResponse = {
  sessionId: string;
  status: 0;
  value: null;
};

export type getAllSessionsResponse = sessionsResponse[] | null;

export type deviceInfoValue = {
  ip: string;
  timeout: number;
  pressDelay: number;
  vendorName: string;
  modelName: string;
  language: string;
  country: string;
};

export type getElementResponse = {
  sessionId: string;
  status: number;
  value: elementValueRaw;
};

export type getFocusedElementResponse = {
  sessionId: string;
  status: number;
  value: elementValueRaw;
};

export type getElementsResponse = {
  sessionId: string;
  status: number;
  value: elementValueRaw[];
};

export type elementValueRaw = {
  XMLName: {
    Space: string;
    Local: string;
  };
  Attrs: {
    Name: {
      Space: string;
      Local: string;
    };
    Value: string;
  }[];
  Nodes: elementValueRaw[] | null;
};

export type elementValueRawAttrs = {
  Name: {
    Space: string;
    Local: string;
  };
  Value: string;
}[];

export type elementValueParsed = {
  XMLName: string;
  Attrs: { [key: string]: string };
  Nodes?: elementValueParsed[];
};

export type deleteSessionResponse = {
  sessionId: string;
  status: number;
  value: null;
};

export type elementDataObject = {
  using: string;
  value: string;
  attribute?: string;
};

export type errorResponse = {
  sessionId: string;
  status: number;
  value: {
    message?: string;
  };
};

export interface LaunchArgs {
  [key: string]: string;
}
