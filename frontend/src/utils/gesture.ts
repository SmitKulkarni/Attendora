/**
 * Pure utility functions for mobile gesture interactions, including
 * swipe-to-dismiss displacement, velocity checks, and dismissal thresholds.
 */

export interface SwipeStateResult {
  translateY: number;
  shouldDismiss: boolean;
  opacityMultiplier: number;
}

/**
 * Calculates current modal displacement and whether a drag gesture should dismiss the modal.
 *
 * @param deltaY - Vertical movement in pixels (positive = downwards, negative = upwards)
 * @param velocityY - Velocity in px/ms (positive = downward flick)
 * @param threshold - Distance threshold in pixels to trigger dismissal (default: 90px)
 * @param velocityThreshold - Minimum downward velocity to trigger dismiss on shorter drags (default: 0.45 px/ms)
 */
export function calculateSwipeDismiss(
  deltaY: number,
  velocityY = 0,
  threshold = 90,
  velocityThreshold = 0.45
): SwipeStateResult {
  if (deltaY < 0) {
    // Upward drag: provide rubber-band resistance
    const resistedY = deltaY * 0.2;
    return {
      translateY: resistedY,
      shouldDismiss: false,
      opacityMultiplier: 1.0,
    };
  }

  // Downward drag
  const shouldDismiss =
    deltaY >= threshold || (deltaY > 25 && velocityY >= velocityThreshold);

  // Attenuate opacity smoothly as sheet is pulled down (minimum 0.1)
  const maxTravel = 320;
  const progress = Math.min(1, Math.max(0, deltaY / maxTravel));
  const opacityMultiplier = Math.max(0.1, Number((1 - progress * 0.9).toFixed(2)));

  return {
    translateY: deltaY,
    shouldDismiss,
    opacityMultiplier,
  };
}
