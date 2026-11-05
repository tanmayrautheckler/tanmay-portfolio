/** Probe before mounting R3F, whose async renderer setup can otherwise reject
 * repeatedly when the browser has disabled WebGL. Release the temporary context.
 */
export function supportsJournal3D(canvas: Pick<HTMLCanvasElement, 'getContext'>): boolean {
  try {
    const context = canvas.getContext('webgl2', {powerPreference:'default'});
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
