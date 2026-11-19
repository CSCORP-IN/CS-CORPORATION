package in.cscorp.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;

public class WebAppInterface {
    private final SharedPreferences prefs;

    public WebAppInterface(Context context) {
        this.prefs = context.getSharedPreferences("CSCorpAuthPrefs", Context.MODE_PRIVATE);
    }

    @JavascriptInterface
    public void saveUserSession(String token, String userJson) {
        prefs.edit()
            .putString("auth_token", token)
            .putString("auth_user", userJson)
            .apply();
    }

    @JavascriptInterface
    public String getSavedToken() {
        return prefs.getString("auth_token", "");
    }

    @JavascriptInterface
    public String getSavedUser() {
        return prefs.getString("auth_user", "");
    }

    @JavascriptInterface
    public void clearUserSession() {
        prefs.edit().clear().apply();
    }

    @JavascriptInterface
    public boolean isNativeApp() {
        return true;
    }
}
