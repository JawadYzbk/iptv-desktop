import { Button, ButtonProps } from "@/components/ui/button";
import { CaptionsIcon } from "lucide-react";
import React, { use, useMemo } from "react";
import VideoPlayerContext from "../context";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CaptionButton: React.FC<ButtonProps> = (props) => {
  const { captionList, doSetCaption } = use(VideoPlayerContext);

  const isDisabled = useMemo(() => {
    const find = captionList.find((it) => it.isActive);
    return !find;
  }, [captionList]);

  return captionList.length === 0 ? (
    <React.Fragment />
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button {...props}>
          <CaptionsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="top">
        <DropdownMenuLabel>Captions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuCheckboxItem
          checked={isDisabled}
          onCheckedChange={(checked) => {
            if (checked) {
              doSetCaption(undefined);
            }
          }}
        >
          Disable
        </DropdownMenuCheckboxItem>
        {captionList.map((it, idx) => (
          <DropdownMenuCheckboxItem
            key={it.id ?? idx}
            checked={it.isActive}
            onCheckedChange={(checked) => {
              if (checked) {
                doSetCaption(it);
              }
            }}
          >
            {it.label ?? it.language}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default CaptionButton;
