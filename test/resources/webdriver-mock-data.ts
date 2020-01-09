import { getPlayerInfoResponse } from '../../src/types/webdriver';

export const verifyChannelExists = [
  {
    Title: 'YouTube TV',
    ID: '195316',
    Type: 'appl',
    Version: '1.0.80000001',
    Subtype: 'ndka',
  },
  {
    Title: 'rocute',
    ID: 'dev',
    Type: 'appl',
    Version: '1.0.1',
    Subtype: 'rsga',
  },
];

export const getElement = {
  XMLName: {
    Space: '',
    Local: 'Label',
  },
  Attrs: [
    {
      Name: {
        Space: '',
        Local: 'bounds',
      },
      Value: '{0, 11, 340, 48}',
    },
    {
      Name: {
        Space: '',
        Local: 'color',
      },
      Value: '#ddddddff',
    },
    {
      Name: {
        Space: '',
        Local: 'index',
      },
      Value: '0',
    },
    {
      Name: {
        Space: '',
        Local: 'text',
      },
      Value: 'Item 1',
    },
  ],
  Nodes: null,
};

export const getElements = [
  {
    XMLName: {
      Space: '',
      Local: 'Label',
    },
    Attrs: [
      {
        Name: {
          Space: '',
          Local: 'bounds',
        },
        Value: '{0, 11, 340, 48}',
      },
      {
        Name: {
          Space: '',
          Local: 'color',
        },
        Value: '#ddddddff',
      },
      {
        Name: {
          Space: '',
          Local: 'index',
        },
        Value: '0',
      },
      {
        Name: {
          Space: '',
          Local: 'text',
        },
        Value: 'HOME',
      },
    ],
    Nodes: null,
  },
  {
    XMLName: {
      Space: '',
      Local: 'Label',
    },
    Attrs: [
      {
        Name: {
          Space: '',
          Local: 'color',
        },
        Value: '#ddddddff',
      },
      {
        Name: {
          Space: '',
          Local: 'index',
        },
        Value: '0',
      },
      {
        Name: {
          Space: '',
          Local: 'opacity',
        },
        Value: '0',
      },
      {
        Name: {
          Space: '',
          Local: 'text',
        },
        Value: 'HOME',
      },
      {
        Name: {
          Space: '',
          Local: 'visible',
        },
        Value: 'false',
      },
    ],
    Nodes: null,
  },
];

export const getElementsMockResponse = [
  {
    Attrs: {
      bounds: '{0, 11, 340, 48}',
      color: '#ddddddff',
      index: '0',
      text: 'HOME',
    },
    XMLName: 'Label',
  },
  {
    Attrs: {
      color: '#ddddddff',
      index: '0',
      opacity: '0',
      text: 'HOME',
      visible: 'false',
    },
    XMLName: 'Label',
  },
];

export const getFocusedElement = {
  XMLName: {
    Space: '',
    Local: 'RenderableNode',
  },
  Attrs: [
    {
      Name: {
        Space: '',
        Local: 'bounds',
      },
      Value: '{0, 0, 340, 48}',
    },
    {
      Name: {
        Space: '',
        Local: 'children',
      },
      Value: '1',
    },
    {
      Name: {
        Space: '',
        Local: 'focusable',
      },
      Value: 'true',
    },
    {
      Name: {
        Space: '',
        Local: 'focused',
      },
      Value: 'true',
    },
    {
      Name: {
        Space: '',
        Local: 'index',
      },
      Value: '0',
    },
  ],
  Nodes: null,
};

export function getPlayerInfo(sessionId: string) {
  const response: getPlayerInfoResponse = {
    sessionId: sessionId,
    status: 0,
    value: {
      Error: 'false',
      State: 'play',
      Format: {
        Audio: 'aac_adts',
        Captions: 'none',
        Container: '',
        Drm: 'none',
        Video: 'mpeg4_10b',
        VideoRes: '',
      },
      Buffering: {
        Current: '',
        Max: '',
        Target: '',
      },
      NewStream: {
        Speed: '',
      },
      Position: '8500 ms',
      Duration: '5000 ms',
      IsLive: 'false',
      Runtime: '',
      StreamSegment: {
        Bitrate: '',
        MediaSequence: '',
        SegmentType: '',
        Time: '',
      },
    },
  };
  return response;
}

export const verifyPlaybackIsStarted = {
  Error: 'false',
  State: 'play',
  Format: {
    Audio: 'aac_adts',
    Captions: 'none',
    Container: '',
    Drm: 'none',
    Video: 'mpeg4_10b',
    VideoRes: '',
  },
  Buffering: {
    Current: '',
    Max: '',
    Target: '',
  },
  NewStream: {
    Speed: '',
  },
  Position: '8500 ms',
  Duration: '5000 ms',
  IsLive: 'false',
  Runtime: '',
  StreamSegment: {
    Bitrate: '',
    MediaSequence: '',
    SegmentType: '',
    Time: '',
  },
};
