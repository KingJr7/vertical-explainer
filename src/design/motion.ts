import {Easing} from 'remotion';

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  linear: Easing.linear,
};

export const DUR = {
  enter: 14,
  exit: 12,
  whip: 9,
  invert: 24,
  flash: 3,
  captionIn: 10,
};
