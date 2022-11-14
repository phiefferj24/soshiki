mkdir -p ~/.soshiki/bin
if [ -f ~/.soshiki/bin/soshiki-proxy-desktop ]; then
    rm ~/.soshiki/bin/soshiki-proxy-desktop
fi
curl -fs http://localhost:3501/proxy/mac/soshiki-proxy-desktop-v1 > ~/.soshiki/bin/soshiki-proxy-desktop
if [ -f ~/Library/LaunchAgents/com.jimphieffer.soshiki-proxy-desktop.plist ]; then
    if [[ $(launchctl list) == *com.jimphieffer.soshiki-proxy-desktop* ]]; then 
        launchctl bootout gui/$UID ~/Library/LaunchAgents/com.jimphieffer.soshiki-proxy-desktop.plist
    fi
    rm ~/Library/LaunchAgents/com.jimphieffer.soshiki-proxy-desktop.plist
fi
curl -fs http://localhost:3501/proxy/mac/com.jimphieffer.soshiki-proxy-desktop.plist > ~/Library/LaunchAgents/com.jimphieffer.soshiki-proxy-desktop.plist
chmod -R 777 ~/.soshiki
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.jimphieffer.soshiki-proxy-desktop.plist
launchctl kickstart gui/$UID/com.jimphieffer.soshiki-proxy-desktop
exit 0