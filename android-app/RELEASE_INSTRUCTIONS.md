## CS Corp Android App Release Guide

### Package Name / Application ID
- **Package Name:** `app.cscorp.in` (Registered on Google Play Console)

---

### Production Build Files (Root Workspace me available)
- **Android App Bundle (.aab):** [CS-Corp.aab](file:///d:/Production/CS%20Corp/CS-Corp.aab) *(Google Play Console publishing ke liye)*
- **Android APK (.apk):** [CS-Corp.apk](file:///d:/Production/CS%20Corp/CS-Corp.apk) *(Direct phone me install karne ke liye)*

---

### Release Signing Keystore Details
Ye bundle aur APK production key se signed hain:
- **Keystore File:** `d:\Production\CS Corp\android-app\app\cscorp-release.jks`
- **Key Alias:** `cscorp`
- **Store Password:** `cscorp@2026`
- **Key Password:** `cscorp@2026`
- **Validity:** 10,000 days (Play Store standard)

---

### Project Location
Aapka complete Android Studio project yahan saved hai:
`d:\Production\CS Corp\android-app\`

---

### Command Line Se Build Karne Ka Command:
Agar future me dubara build karna ho:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd "d:\Production\CS Corp\android-app"
C:\Users\offic\.gradle\wrapper\dists\gradle-9.3.1-bin\23ovyewtku6u96viwx3xl3oks\gradle-9.3.1\bin\gradle.bat bundleRelease --no-daemon
```

---

### Tareeqa: Instant PWA Install (Bina Kisi File Ke Phone Me Direct Install)
1. Mobile ke Chrome me apni site open karein: `https://cscorp.in`
2. Chrome ke top-right 3-dots menu par tap karein.
3. **"Install App"** ya **"Add to Home screen"** dabayein.
4. Mobile home screen par [appicon.png](file:///d:/Production/CS%20Corp/appicon.png) ke saath direct **CS Corp App** install ho jayegi!
