package app.cscorp.in;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    
    // Website URL - Change this to your live domain (e.g., https://cscorp.in) or testing URL
    private static final String TARGET_URL = "https://cscorp.in";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefreshLayout);

        // Apply Top System Window Insets (Status bar + Camera Notch Margin)
        ViewCompat.setOnApplyWindowInsetsListener(swipeRefresh, (view, insets) -> {
            int topInset = insets.getInsets(WindowInsetsCompat.Type.systemBars()).top;
            view.setPadding(0, topInset, 0, 0);
            return insets;
        });

        // Configure Swipe Refresh
        swipeRefresh.setColorSchemeColors(0xFFEA580C); // CS Corp Orange
        swipeRefresh.setOnRefreshListener(() -> webView.reload());

        // Configure WebSettings for full modern app capability & Persistent Storage
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);              // Enables localStorage for persistent login
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Native App Feel enhancements:
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        // Custom User-Agent tag to allow client to optimize for native mobile
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " CSCorpNativeApp/1.0");

        // Native Android Bridge for 100% Guaranteed Persistent SharedPreferences Session
        webView.addJavascriptInterface(new WebAppInterface(this), "AndroidAuthBridge");

        // Persistent Cookies / Session Storage
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // Handle navigation inside WebView
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false; // Keep browsing inside the app
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
                // Flush cookies to disk so login persists across phone restarts
                CookieManager.getInstance().flush();
            }
        });

        webView.setWebChromeClient(new WebChromeClient());

        // Handle Back button for internal WebView history navigation
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        // Load Website
        if (savedInstanceState == null) {
            webView.loadUrl(TARGET_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }
}
