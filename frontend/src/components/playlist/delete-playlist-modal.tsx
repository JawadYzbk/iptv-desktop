import React, { use, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { DeletePlaylist } from "wailsjs/go/service/IPTV";
import { toast } from "sonner";
import PlaylistContext from "@/context/playlist.context";
import { service } from "wailsjs/go/models";
import { useNavigate, useParams } from "react-router";

interface Props {
  open?: boolean;
  onClose?: () => void;
  playlist?: service.Playlist;
}
const DeletePlaylistModal: React.FC<Props> = ({ open, onClose, playlist }) => {
  const { filterType, code } = useParams();
  const navigate = useNavigate();
  const [memorizedTitle, setMemorizedTitle] = useState<string | undefined>(
    playlist?.title
  );
  const { doRefreshPlaylist } = use(PlaylistContext);

  useEffect(() => {
    if (playlist) {
      setMemorizedTitle(playlist.title);
    }
  }, [playlist]);

  const onDelete = async () => {
    if (!playlist) return;
    const error = await DeletePlaylist(playlist.playlistId);
    if (error) {
      toast("Something Went Wrong!", {
        description: error,
      });
    } else {
      if (
        filterType === service.IPTVFilter.PLAYLIST &&
        code === playlist.playlistId.toString()
      ) {
        navigate(`/home/${filterType}`);
      }
      await doRefreshPlaylist?.();
      toast("Playlist Deleted!");
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-96 w-full">
        <DialogHeader>
          <DialogTitle>Are You Sure?</DialogTitle>
          <DialogDescription>
            Do you really want do delete playlist {memorizedTitle}?.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onDelete} variant="destructive">
            Yes, Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DeletePlaylistModal;
