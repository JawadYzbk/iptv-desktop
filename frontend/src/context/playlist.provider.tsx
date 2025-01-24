import React, { useEffect, useState } from "react";
import { service } from "wailsjs/go/models";
import LoadingScreen from "@/components/loading-screen";
import { GetAllPlaylist } from "wailsjs/go/service/IPTV";
import PlaylistContext from "./playlist.context";
import { toast } from "sonner";
import CreatePlaylistModal from "@/components/playlist/create-playlist-modal";
import SavePlaylistModal from "@/components/playlist/save-playlist-modal";
import DeletePlaylistModal from "@/components/playlist/delete-playlist-modal";

interface Props {
  children?: React.ReactNode;
}

const PlaylistProvider: React.FC<Props> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [playlists, setPlaylists] = useState<service.Playlist[]>([]);
  const [isShowCreate, setIsShowCreate] = useState(false);
  const [showSavePlaylist, setShowSavePlaylist] = useState<service.Channel>();
  const [showEditPlaylist, setShowEditPlaylist] = useState<service.Playlist>();
  const [showDeletePlaylist, setShowDeletePlaylist] =
    useState<service.Playlist>();

  useEffect(() => {
    (async () => {
      await doRefreshPlaylist();
    })();
  }, []);

  const doRefreshPlaylist = async () => {
    const resPlaylists = await GetAllPlaylist();
    if (resPlaylists.data !== undefined && resPlaylists.data !== null) {
      setPlaylists(resPlaylists.data);
    }
    if (resPlaylists.error) {
      toast("Something Went Wrong!", {
        description: resPlaylists.error,
      });
    } else {
      setIsLoaded(true);
    }
  };

  const doShowCreatePlaylist = () => setIsShowCreate(true);

  return isLoaded ? (
    <PlaylistContext.Provider
      value={{
        playlists,
        doRefreshPlaylist,
        doShowCreatePlaylist,
        setShowSavePlaylist,
        setShowEditPlaylist,
        doShowDeletePlaylist: setShowDeletePlaylist,
      }}
    >
      {children}
      <SavePlaylistModal
        open={showSavePlaylist !== undefined}
        onClose={() => setShowSavePlaylist(undefined)}
        channel={showSavePlaylist}
      />
      <CreatePlaylistModal
        isEdit={true}
        playlist={showEditPlaylist}
        open={showEditPlaylist !== undefined}
        onClose={() => setShowEditPlaylist(undefined)}
      />
      <CreatePlaylistModal
        open={isShowCreate}
        onClose={() => setIsShowCreate(false)}
      />
      <DeletePlaylistModal
        playlist={showDeletePlaylist}
        open={showDeletePlaylist !== undefined}
        onClose={() => setShowDeletePlaylist(undefined)}
      />
    </PlaylistContext.Provider>
  ) : (
    <LoadingScreen />
  );
};
export default PlaylistProvider;
