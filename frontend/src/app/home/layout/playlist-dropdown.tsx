import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import PlaylistContext from "@/context/playlist.context";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { EditIcon, TrashIcon } from "lucide-react";
import React, { use } from "react";
import { service } from "wailsjs/go/models";

interface Props {
  playlist: service.Playlist;
  className?: string;
  children?: React.ReactNode;
}
const PlaylistDropdown: React.FC<Props> = ({
  playlist,
  className,
  children,
}) => {
  const { setShowEditPlaylist, doShowDeletePlaylist } = use(PlaylistContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className={className}>
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <DropdownMenuLabel className="truncate">
          {playlist.title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowEditPlaylist(playlist)}>
          <EditIcon /> Change Title
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => doShowDeletePlaylist(playlist)}
          className="hover:!bg-destructive hover:!text-destructive-foreground"
        >
          <TrashIcon />
          Delete Playlist
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default PlaylistDropdown;
