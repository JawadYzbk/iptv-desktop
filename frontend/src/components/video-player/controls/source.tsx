import { Button, ButtonProps } from "@/components/ui/button";
import { ListVideoIcon } from "lucide-react";
import React, { use } from "react";
import VideoPlayerContext from "../context";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SourceButton: React.FC<ButtonProps> = (props) => {
  const { sources, setSourceIndex, sourceIndex } = use(VideoPlayerContext);

  return sources.length < 2 ? (
    <React.Fragment />
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button {...props}>
          <ListVideoIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="top">
        <DropdownMenuLabel>Stream Source</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {sources.map((_, idx) => (
          <DropdownMenuCheckboxItem
            key={idx}
            checked={idx === sourceIndex}
            onCheckedChange={(checked) => {
              if (checked) {
                setSourceIndex(idx);
              }
            }}
          >
            Stream #{idx + 1}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default SourceButton;
