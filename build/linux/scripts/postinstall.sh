if update-alternatives --display iptv-desktop > /dev/null 2>&1; then
  update-alternatives --remove iptv-desktop /opt/IPTV\ Desktop/iptv-desktop
fi

update-desktop-database /usr/share/applications