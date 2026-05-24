import React from 'react';

export const NavCtx = React.createContext({
  go: () => {}, back: () => {}, reset: () => {},
  openDish: () => {}, openCart: () => {},
  addToCart: () => {}, incCart: () => {}, decCart: () => {}, removeCart: () => {}, getQty: () => 0,
  cart: [], cartCount: 0, cartTotal: 0,
  authUser: null, openAuth: () => {}, logout: () => {},
});

export const useNav = () => React.useContext(NavCtx);
