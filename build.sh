electron-builder --mac --universal
electron-builder --win --arm64 --x64 --ia32
electron-builder --linux AppImage --x64
electron-builder --linux deb --x64

cd dist

# extract the version part from the filename using a regex
VERSION=$(echo $(ls | grep 'HaxBall Client.*\.exe') | sed -E 's/HaxBall Client-([0-9]+\.[0-9]+\.[0-9]+)-.*/\1/')

zip -r "HaxBall Client-${VERSION}-win-portable.zip" "HaxBall Client-${VERSION}.exe"
zip -r "HaxBall Client-${VERSION}-linux.zip" *.deb *.AppImage