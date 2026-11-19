# Proguard / R8 rules for CS Corp Android App

# Preserve line numbers and source file for Play Console stack traces
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# Crucial: Keep all JavaScriptInterface methods for WebView persistent storage bridge
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class app.cscorp.in.WebAppInterface { *; }
-keepclassmembers class app.cscorp.in.WebAppInterface { *; }

# Keep AndroidX & WebKit classes
-keep class androidx.webkit.** { *; }
-dontwarn androidx.webkit.**
