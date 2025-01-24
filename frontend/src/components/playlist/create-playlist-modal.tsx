import React, { use, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "../ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CreatePlaylist, UpdatePlaylist } from "wailsjs/go/service/IPTV";
import { toast } from "sonner";
import PlaylistContext from "@/context/playlist.context";
import { service } from "wailsjs/go/models";

const formSchema = z.object({
  title: z.string(),
});

interface Props {
  open?: boolean;
  onClose?: () => void;
  isEdit?: boolean;
  playlist?: service.Playlist;
}
const CreatePlaylistModal: React.FC<Props> = ({
  open,
  onClose,
  isEdit,
  playlist,
}) => {
  const { doRefreshPlaylist } = use(PlaylistContext);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isEdit) {
      form.reset({
        title: playlist?.title,
      });
    }
  }, [playlist, isEdit]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let res: service.SinglePlaylistResult;
    if (isEdit) {
      res = await UpdatePlaylist(playlist!.playlistId, values.title);
    } else {
      res = await CreatePlaylist(values.title);
    }
    if (res.error) {
      toast("Something Went Wrong!", {
        description: res.error,
      });
    } else {
      await doRefreshPlaylist?.();
      if (isEdit) {
        toast("Playlist Saved!");
      } else {
        toast("Playlist Created!");
      }
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-80 w-full">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Create"} Playlist</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Change the playlist title."
              : "Create a new playlist in your local device"}
            .
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">{isEdit ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default CreatePlaylistModal;
