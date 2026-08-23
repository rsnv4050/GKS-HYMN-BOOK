# The GKS Hymn Book — Android app (v2.0, rebuilt)

A modern, offline Android app of the **Theocratic Songs of Praise** (God's Kingdom
Society hymn book). It contains all **204 items** from the original app — hymns
TSP 1–192, the special psalms, canticles, Te Deum, chant, preface and the "About
the Designer" page — every word preserved verbatim from the original.

This is a ground-up rebuild of the old 2015 Intel XDK / Cordova 2.9 app so it
**installs and runs on the latest Android (14 / 15)**. See `REVIEW.md` for exactly
what was wrong with the old build and what changed.

---

## What you get

* Fast, dependency-free web UI (no jQuery / jQuery Mobile) inside a hardened WebView.
* Works **100% offline** — no network, and the app requests **zero permissions**.
* Search by hymn **number or title**, previous/next navigation, tap-to-open index.
* Adjustable **text size** and a **dark theme**, remembered between launches.
* `targetSdk 35`, `minSdk 24`, non-debuggable, adaptive launcher icon.

---

## Get an installable APK — pick one route

### Route A — GitHub Actions (no tools to install) ✅ easiest
1. Create a new GitHub repo and push this project to it (branch `main`).
2. Open the **Actions** tab → the *Build GKS Hymn Book APK* workflow runs.
3. When it finishes, open the run → **Artifacts** → download
   `gks-hymn-book-release-apk`. Inside is the signed, installable `app-release.apk`.

The workflow (`.github/workflows/build-apk.yml`) installs the Android SDK, generates
a signing key, and builds a signed release APK for you.

### Route B — Android Studio (GUI)
1. **File ▸ Open** this folder in Android Studio (Koala or newer). Let it sync.
2. **Build ▸ Generate Signed App Bundle / APK ▸ APK**, create/choose a keystore,
   pick **release**, finish. The APK appears under `app/build/outputs/apk/release/`.

### Route C — command line
```bash
# one-time: create a signing key
keytool -genkeypair -v -keystore gks.jks -storepass gkspass -keypass gkspass \
  -alias gks -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=GKS Hymn Book, O=God's Kingdom Society, C=NG"

# build a signed release APK
export GKS_KEYSTORE="$PWD/gks.jks"
export GKS_STORE_PASSWORD=gkspass GKS_KEY_ALIAS=gks GKS_KEY_PASSWORD=gkspass
./gradlew :app:assembleRelease
# -> app/build/outputs/apk/release/app-release.apk
```
Requires JDK 17 and the Android SDK (Android Studio installs both).

---

## Install on a phone
Copy the `.apk` to the device and open it, allowing "install from this source".
Because it's signed and targets a current SDK, it installs on Android 7 → 15.

## Publishing updates
Keep **the same keystore** for every release and bump `versionCode` / `versionName`
in `app/build.gradle`. Re-using the key lets new versions upgrade in place.
For Google Play, upload the **App Bundle**: `./gradlew :app:bundleRelease`.

## Project layout
```
app/src/main/assets/www/   the hymn book web app (index.html, app.js, styles.css)
app/src/main/java/...       MainActivity.kt (WebView host)
app/src/main/AndroidManifest.xml
app/build.gradle            SDK levels + signing
.github/workflows/          CI that builds the APK
```
