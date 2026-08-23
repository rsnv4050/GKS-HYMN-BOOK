# Deep review of the original `base.apk`

## Identity
| | |
|---|---|
| Package | `com.victorujene.www` |
| Launch activity | `com.phonegap.www.GKSHYMNS` |
| versionName / versionCode | `1.0` / `1` |
| Built with | Intel XDK + Apache **Cordova 2.9.0** (2013), jQuery 1.6.4, jQuery Mobile 1.0 |
| Content | 204 items — TSP 1–192, psalms, canticles, Te Deum, chant, preface, about |

## Why it will not run on a modern phone
1. **`targetSdkVersion=17`, `minSdkVersion=7`.** Android 14 (API 34) **blocks
   installation of any app targeting below API 23**, and Android 15 tightened this
   further. The old APK is therefore uninstallable on current devices — re-signing
   it does **not** fix this, because the target level is baked into the manifest.
2. **`android:debuggable="true"`** shipped in the release — a security red flag and
   a Play Store rejection reason.
3. **17 permissions requested, ~all unnecessary** for a hymn book:
   `CAMERA`, `ACCESS_FINE/COARSE_LOCATION`, `RECEIVE_SMS`, `RECORD_AUDIO`,
   `RECORD_VIDEO`, `READ/WRITE_CONTACTS`, `GET_ACCOUNTS`, `WRITE_EXTERNAL_STORAGE`,
   `BROADCAST_STICKY`, etc. This is the Intel XDK "kitchen-sink" default. Modern
   Android shows scary permission prompts and Play would reject several of these.
4. **Ancient WebView stack.** Cordova 2.9 (2013) is long past end-of-life; jQuery
   Mobile 1.0 is abandoned and renders poorly / inconsistently on modern WebView.
5. **`versionCode=1`** leaves no room to ship an in-place upgrade cleanly.

## Content / code issues found
* All 204 "pages" live in one 566 KB `index.html` as jQuery-Mobile `data-role="page"`
  divs — heavy and slow to parse.
* Minor HTML defects in the original markup: an index `<li>` for *"DOXOLOGIES…"*
  has a stray `</a>` with no opening anchor; a few `<pre>`/`</p>` tags are unbalanced.
  These were normalised in the rebuild.
* A 2.9 MB uncompressed photo and a `.psd` file were bundled as assets, bloating the
  APK for no benefit.
* Depends on jQuery + jQuery Mobile being loaded before render — a single failure
  leaves a blank screen.

## What the rebuild changes
| Area | Old | New |
|---|---|---|
| Target SDK | 17 | **35** (installs on Android 7→15) |
| Min SDK | 7 | 24 |
| Permissions | 17 | **0** |
| debuggable | true | **false** |
| Framework | Cordova 2.9 + jQuery Mobile 1.0 | **Vanilla JS**, no dependencies |
| Host | old Cordova WebView | AndroidX `WebView` + `webkit` (algorithmic dark mode) |
| Features | static list | search by number/title, prev/next, font size, dark theme, remembers settings |
| Assets | 2.9 MB photo + .psd | photo compressed to 42 KB, .psd dropped |
| Icon | legacy PNG | adaptive launcher icon |
| Content | 204 items | **same 204 items, preserved verbatim** |

## Note on producing the `.apk` here
A signed APK must be compiled with the Android SDK build tools, which download the
Android Gradle Plugin and AndroidX from Google's servers. This build sandbox blocks
those servers, so the final byte-compilation is done by the included **GitHub Actions
workflow** (or Android Studio / `./gradlew` on your machine) — all three are wired up
and ready in this project. See `README.md`.
