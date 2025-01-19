import { Button, ButtonProps } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import React, { useState } from "react";
import SettingsModal from "../settings-modal";

const SettingsButton: React.FC<ButtonProps> = (props) => {
  const [isShowSettings, setIsShowSettings] = useState(false);

  return (
    <React.Fragment>
      <Button {...props} onClick={() => setIsShowSettings(true)}>
        <SettingsIcon />
        <span className="sr-only">Settings</span>
      </Button>
      <SettingsModal
        open={isShowSettings}
        onClose={() => setIsShowSettings(false)}
      />
    </React.Fragment>
  );
};
export default SettingsButton;
