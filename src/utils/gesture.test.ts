import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSwipeDismiss } from './gesture.ts';

test('calculateSwipeDismiss handles upward rubber-band resistance', () => {
  const result = calculateSwipeDismiss(-50, 0);
  assert.equal(result.translateY, -10, 'Should apply 0.2 rubber-band dampening to upward drag');
  assert.equal(result.shouldDismiss, false, 'Upward drag should never dismiss');
  assert.equal(result.opacityMultiplier, 1.0, 'Backdrop opacity should remain full on upward pull');
});

test('calculateSwipeDismiss handles small downward drag without dismissing', () => {
  const result = calculateSwipeDismiss(40, 0.1);
  assert.equal(result.translateY, 40);
  assert.equal(result.shouldDismiss, false, 'Drag below threshold with low velocity should not dismiss');
  assert.ok(result.opacityMultiplier < 1.0, 'Backdrop opacity should begin to soften');
});

test('calculateSwipeDismiss dismisses when distance threshold is reached', () => {
  const result = calculateSwipeDismiss(95, 0.05);
  assert.equal(result.translateY, 95);
  assert.equal(result.shouldDismiss, true, 'Drag >= 90px threshold should trigger dismissal');
});

test('calculateSwipeDismiss dismisses on quick downward flick with low distance', () => {
  const result = calculateSwipeDismiss(35, 0.6);
  assert.equal(result.translateY, 35);
  assert.equal(result.shouldDismiss, true, 'Quick downward swipe flick should trigger dismissal');
});

test('calculateSwipeDismiss smooths opacity as sheet descends', () => {
  const rZero = calculateSwipeDismiss(0);
  const rMid = calculateSwipeDismiss(160);
  const rMax = calculateSwipeDismiss(400);

  assert.equal(rZero.opacityMultiplier, 1.0);
  assert.ok(rMid.opacityMultiplier < 1.0 && rMid.opacityMultiplier > 0.4);
  assert.equal(rMax.opacityMultiplier, 0.1, 'Should clamp to minimum 0.1 opacity');
});
