export enum ECustomEvent {
  prevChannel = "prevChannel",
  nextChannel = "nextChannel",
}

export const dispatchCustomEvent = (event: ECustomEvent) => {
  window.dispatchEvent(new Event(event));
};
