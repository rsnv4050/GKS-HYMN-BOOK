package ng.org.gks.hymnbook

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature

/**
 * Single-activity host for the offline GKS Hymn Book web app.
 * All content lives in app/src/main/assets/www and never touches the network.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        web = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        setContentView(web)

        web.settings.apply {
            javaScriptEnabled = true          // required for search / navigation
            domStorageEnabled = true          // localStorage for saved settings
            cacheMode = WebSettings.LOAD_NO_CACHE
            builtInZoomControls = false
            textZoom = 100
            allowFileAccess = false           // hardening: no filesystem beyond assets
            allowContentAccess = false
        }

        // Let the web layer follow the system light/dark theme when supported.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(web.settings, true)
        }

        // Keep all navigation inside the app (there are no external links anyway).
        web.webViewClient = WebViewClient()

        if (savedInstanceState == null) {
            web.loadUrl("file:///android_asset/www/index.html")
        } else {
            web.restoreState(savedInstanceState)
        }

        // Route the Android back gesture into the web app's own history first.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                web.evaluateJavascript(
                    "(window.onBack && window.onBack()) ? '1' : '0'"
                ) { handled ->
                    if (handled != "\"1\"" && handled != "1") {
                        // Web app was already at home; let the default back happen.
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                        isEnabled = true
                    }
                }
            }
        })
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }
}
