import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { use, useEffect } from "react";
import ConfigContext from "@/context/config.context";
import { toast } from "sonner";
import { DeleteAllCache } from "wailsjs/go/service/CacheStore";
import {
  DefaultConfig,
  DeleteConfigs,
  SetConfigs,
} from "wailsjs/go/service/ConfigStore";
import { n } from "react-router/dist/development/fog-of-war-Ckdfl79L";

const formSchema = z.object({
  isUseAltChannelName: z.boolean(),
  isOverrideApi: z.boolean(),
  apiUrl: z.string().url(),
  cacheDuration: z.string(),

  isUseDOH: z.boolean(),
  dohResolverUrl: z.string().url(),

  isAutoShowCaption: z.boolean(),

  isUseSystemTitlebar: z.boolean(),
});

interface DBConfigStruct {
  "iptv.isOverrideApi"?: string;
  "iptv.apiUrl"?: string;
  "iptv.cacheDuration"?: string;
  "iptv.isUseAltChannelName"?: string;
  "network.isUseDOH"?: string;
  "network.dohResolverUrl"?: string;
  "caption.isAutoShow"?: string;
  "userInterface.isUseSystemTitlebar"?: string;
}

const cacheDurationOptions = [
  {
    label: "15 Minutes",
    value: (60 * 15).toString(),
  },
  {
    label: "30 Minutes",
    value: (60 * 30).toString(),
  },
  {
    label: "1 Hour",
    value: (60 * 60).toString(),
  },
  {
    label: "1 Day",
    value: (60 * 60 * 24).toString(),
  },
  {
    label: "1 Week",
    value: (60 * 60 * 24 * 7).toString(),
  },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}
const SettingsModal: React.FC<Props> = ({ open, onClose }) => {
  const { config } = use(ConfigContext);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const isOverrideApi = useWatch({
    control: form.control,
    name: "isOverrideApi",
  });

  const isUseDOH = useWatch({
    control: form.control,
    name: "isUseDOH",
  });

  useEffect(() => {
    if (config) {
      form.reset({
        isUseAltChannelName: config?.iptv.isUseAltChannelName,
        isOverrideApi: config?.iptv.isOverrideApi,
        apiUrl: config?.iptv.apiUrl,
        cacheDuration: config?.iptv.cacheDuration.toString(),

        isUseDOH: config?.network.isUseDOH,
        dohResolverUrl: config?.network.dohResolverUrl,

        isAutoShowCaption: config?.caption.isAutoShow,

        isUseSystemTitlebar: config?.userInterface.isUseSystemTitlebar,
      });
    }
  }, [config]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const defaultConfig = await DefaultConfig();

    const boolVal = (
      newVal: boolean | undefined,
      defaultVal: boolean
    ): string | undefined => {
      if (newVal === undefined) return undefined;
      if (newVal == defaultVal) {
        return undefined;
      }

      return newVal ? "1" : "0";
    };
    const stringVal = (
      newVal: string | undefined,
      defaultVal: string
    ): string | undefined => {
      if (newVal === undefined) return undefined;
      if (newVal == defaultVal) {
        return undefined;
      }

      return newVal;
    };

    const intVal = (
      newVal: string | undefined,
      defaultVal: number
    ): string | undefined => {
      if (newVal === undefined) return undefined;
      if (parseInt(newVal) == defaultVal) {
        return undefined;
      }

      return newVal;
    };

    const data: DBConfigStruct = {
      "iptv.isUseAltChannelName": boolVal(
        values.isUseAltChannelName,
        defaultConfig.iptv.isUseAltChannelName
      ),
      "iptv.isOverrideApi": boolVal(
        values.isOverrideApi,
        defaultConfig.iptv.isOverrideApi
      ),
      "iptv.apiUrl": stringVal(values.apiUrl, defaultConfig.iptv.apiUrl),
      "iptv.cacheDuration": intVal(
        values.cacheDuration,
        defaultConfig.iptv.cacheDuration
      ),
      "network.isUseDOH": boolVal(
        values.isUseDOH,
        defaultConfig.network.isUseDOH
      ),
      "network.dohResolverUrl": stringVal(
        values.dohResolverUrl,
        defaultConfig.network.dohResolverUrl
      ),
      "caption.isAutoShow": boolVal(
        values.isAutoShowCaption,
        defaultConfig.caption.isAutoShow
      ),
      "userInterface.isUseSystemTitlebar": boolVal(
        values.isUseSystemTitlebar,
        defaultConfig.userInterface.isUseSystemTitlebar
      ),
    };
    let needDelete: string[] = [];
    if (!values.isOverrideApi) {
      delete data["iptv.isOverrideApi"];
      needDelete.push("iptv.isOverrideApi");
    }
    if (!values.isUseDOH) {
      delete data["network.dohResolverUrl"];
      needDelete.push("network.dohResolverUrl");
    }

    for (const key in data) {
      if (data[key as keyof DBConfigStruct] === undefined) {
        delete data[key as keyof DBConfigStruct];
        needDelete.push(key);
      }
    }
    const errDelete = await DeleteConfigs(needDelete);
    if (errDelete) {
      toast("Action Failed!", {
        description: errDelete,
      });
      return;
    }

    const err = await SetConfigs(data as { [key: string]: string });
    if (err) {
      toast("Action Failed!", {
        description: err,
      });
    } else {
      onClose?.();
      toast("Action Success!", {
        description: "New settings will applied after restart!",
      });
    }
  };

  const doDeleteCache = async () => {
    const res = await DeleteAllCache();
    if (res) {
      toast("Action Success!", {
        description: "Cache file successfully deleted!",
      });
    } else {
      toast("Action Failed!", {
        description: "Cache file can't deleted!",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full w-full max-h-[80vh]"
          >
            <DialogHeader className="p-6">
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Change the IPTV Desktop application Settings.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="overflow-y-scroll flex-1 p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary">IPTV Data</h3>

                  <FormField
                    control={form.control}
                    name="isUseAltChannelName"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Alternative Channel Name
                          </FormLabel>
                          <FormDescription>
                            Use alternative channel name (usually local name).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isOverrideApi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Custom API
                          </FormLabel>
                          <FormDescription>
                            Use Custom iptv-org API URL.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IPTV API Base URL</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isOverrideApi} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cacheDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Cache Duration</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cacheDurationOptions.map((item) => (
                                <SelectItem value={item.value} key={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      doDeleteCache();
                    }}
                  >
                    Clear Cache
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary">Network</h3>

                  <FormField
                    control={form.control}
                    name="isUseDOH"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Use DOH</FormLabel>
                          <FormDescription>
                            Use Custom DNS Over HTTPS Resolver.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dohResolverUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DOH Resolver URL</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isUseDOH} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary">Captions</h3>
                  <FormField
                    control={form.control}
                    name="isAutoShowCaption"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Auto Show Caption
                          </FormLabel>
                          <FormDescription>
                            Automatically select and show available caption.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary">
                    User Interface
                  </h3>
                  <FormField
                    control={form.control}
                    name="isUseSystemTitlebar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Use System Titlebar
                          </FormLabel>
                          <FormDescription>
                            Use default system titlebar instead of custom one.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <DialogFooter className="p-6">
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default SettingsModal;
