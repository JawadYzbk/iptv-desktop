import { createContext } from "react";
import { service } from "wailsjs/go/models";

interface IPlaylistContext {
  playlists: service.Playlist[];
  doRefreshPlaylist?: () => Promise<void>;
  doShowCreatePlaylist: () => void;
  setShowSavePlaylist: (channel: service.Channel) => void;
  setShowEditPlaylist: (playlist: service.Playlist) => void;
  doShowDeletePlaylist: (playlist: service.Playlist) => void;
}
const PlaylistContext = createContext<IPlaylistContext>({
  playlists: [],
  doShowCreatePlaylist: () => {},
  setShowSavePlaylist: () => {},
  setShowEditPlaylist: () => {},
  doShowDeletePlaylist: () => {},
});
export default PlaylistContext;
