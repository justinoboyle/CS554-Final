export function convertVolumeToShorthand(volume: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact'}).format(volume);
}