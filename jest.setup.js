/* eslint-env jest */

import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  return ({ children, ...props }) => React.createElement(View, props, children);
});

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    WebView: props => React.createElement(View, props),
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MapView = ({ children, ...props }) => React.createElement(View, props, children);
  const Marker = ({ children, ...props }) => React.createElement(View, props, children);

  return {
    __esModule: true,
    default: MapView,
    Marker,
    PROVIDER_DEFAULT: 'default',
    PROVIDER_GOOGLE: 'google',
  };
});
