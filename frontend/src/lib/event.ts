export enum ECustomEvent {
  prevChannel = "prevChannel",
  nextChannel = "nextChannel",

  removePlaylistItem = "removePlaylistItem",
}

export const dispatchCustomEvent = (event: ECustomEvent) => {
  window.dispatchEvent(new Event(event));
};

export interface RemovePlaylistItemEvent {
  playlistId: number;
  channelId: string;
}
export const dispatchRemovePlaylistItemEvent = (
  data: RemovePlaylistItemEvent
) => {
  const event = new CustomEvent<RemovePlaylistItemEvent>(
    ECustomEvent.removePlaylistItem,
    {
      detail: data,
    }
  );

  window.dispatchEvent(event);
};
