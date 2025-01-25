import React, { use, useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import PlaylistContext from "@/context/playlist.context";
import { service } from "wailsjs/go/models";
import { Button } from "../ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import Spinner from "../spinner";
import {
  CreatePlaylistItem,
  DeletePlaylistItem,
  GetAllChannelPlaylistItem,
} from "wailsjs/go/service/IPTV";
import { toast } from "sonner";
import { dispatchRemovePlaylistItemEvent } from "@/lib/event";

interface Props {
  open?: boolean;
  onClose?: () => void;
  channel?: service.Channel;
}
const SavePlaylistModal: React.FC<Props> = ({ open, onClose, channel }) => {
  const [memorizedChannel, setMemorizedChannel] = useState<
    service.Channel | undefined
  >(channel);
  const { playlists, doShowCreatePlaylist } = use(PlaylistContext);
  const [isLoading, startLoading] = useTransition();
  const [savedPlaylistId, setSavedPlaylistId] = useState<number[]>([]);

  useEffect(() => {
    if (channel) {
      setMemorizedChannel(channel);
      setSavedPlaylistId([]);
      startLoading(async () => {
        const res = await GetAllChannelPlaylistItem(channel.id);
        if (res.error) {
          toast("Something Went Wrong!", {
            description: res.error,
          });
        } else {
          setSavedPlaylistId((res.data || []).map((item) => item.playlistId));
        }
      });
    }
  }, [channel]);

  const doAdd = async (playlist: service.Playlist) => {
    if (!channel) return;
    const res = await CreatePlaylistItem(playlist.playlistId, channel.id);
    if (res.error) {
      toast("Can't add to playlist!", {
        description: res.error,
      });
    } else if (res.data) {
      toast("Action Success!", {
        description: channel.name + " added to " + playlist.title,
      });
      setSavedPlaylistId((prev) => [...prev, res.data!.playlistId]);
    }
  };

  const doRemove = async (playlist: service.Playlist) => {
    if (!channel) return;
    const error = await DeletePlaylistItem(playlist.playlistId, channel.id);
    if (error) {
      toast("Can't remove from playlist!", {
        description: error,
      });
    } else {
      toast("Action Success!", {
        description: channel.name + " removed from " + playlist.title,
      });
      dispatchRemovePlaylistItemEvent({
        playlistId: playlist.playlistId,
        channelId: channel.id,
      });
      setSavedPlaylistId((prev) => [
        ...prev.filter((it) => it !== playlist.playlistId),
      ]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-80 w-full p-0 max-h-[80vh] flex flex-col gap-0">
        <DialogHeader className="p-4">
          <DialogTitle>Save To Playlist</DialogTitle>
          <DialogDescription>
            Save {memorizedChannel?.name} to playlist.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="overflow-y-auto flex-1 min-h-0 relative">
          {playlists.map((item) => (
            <React.Fragment key={item.playlistId}>
              <div className="px-4 py-2 flex items-center gap-2">
                <h4 className="min-w-0 flex-1">{item.title}</h4>
                {savedPlaylistId.includes(item.playlistId) ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => doRemove(item)}
                  >
                    <XIcon />
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => doAdd(item)}
                  >
                    <PlusIcon />
                  </Button>
                )}
              </div>
              <Separator />
            </React.Fragment>
          ))}
          {isLoading && <Spinner isAbsolute={true} />}
        </div>
        <DialogFooter className="p-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={doShowCreatePlaylist}
          >
            <PlusIcon />
            Create New Playlist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SavePlaylistModal;
