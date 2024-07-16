// src/index.js
import React from 'react';
import { render } from '@wordpress/element';
import { MantineProvider, createTheme } from '@mantine/core';
import './style/main.scss';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import store from './store';
import App from './App';
import { Provider } from 'react-redux';

const theme = createTheme({
    colorScheme: 'light',
    primaryColor: 'blue',
    fontFamily: 'Open Sans, sans-serif',
})

render(
  // <Provider withGlobalStyles withNormalizeCSS store={store}>
  <Provider store={store}>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </Provider>,
  document.getElementById('lazy_pms')
);