import Icon from "@/assets/images/icon.png";

const LoadingScreen: React.FC = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <div className="flex items-center flex-col gap-2">
      <img src={Icon} alt="IPTV Desktop" className="size-16" />
      <h1 className="text-primary font-bold">IPTV Desktop</h1>
    </div>
  </div>
);
export default LoadingScreen;
