set -e
mkdir -p fonts && cd fonts
B=https://cdn.jsdelivr.net/npm
for f in "@fontsource-variable/alexandria@5/files/alexandria-arabic-wght-normal.woff2" "@fontsource-variable/alexandria@5/files/alexandria-latin-wght-normal.woff2" \
 "@fontsource/ibm-plex-sans-arabic@5/files/ibm-plex-sans-arabic-arabic-400-normal.woff2" "@fontsource/ibm-plex-sans-arabic@5/files/ibm-plex-sans-arabic-arabic-600-normal.woff2" \
 "@fontsource/ibm-plex-sans-arabic@5/files/ibm-plex-sans-arabic-latin-400-normal.woff2" "@fontsource/ibm-plex-sans-arabic@5/files/ibm-plex-sans-arabic-latin-600-normal.woff2" \
 "@fontsource/cormorant-garamond@5/files/cormorant-garamond-latin-500-normal.woff2" "@fontsource/cormorant-garamond@5/files/cormorant-garamond-latin-500-italic.woff2"; do
  n=$(basename "$f"); [ -f "$n" ] || curl -fsSL "$B/$f" -o "$n" || echo "FAIL $f"
done
ls -la
