-keep class androidx.multidex.** { *; }
-keep class android.support.multidex.** { *; }
-keep class com.android.support.multidex.** { *; }

# Keep the application class
-keep class * extends android.app.Application { *; }

# Keep all classes that extend Activity, Service, etc.
-keep class * extends android.app.Activity { *; }
-keep class * extends android.app.Service { *; }
-keep class * extends android.content.BroadcastReceiver { *; }
-keep class * extends android.content.ContentProvider { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep JNI related classes
-keep class org.libreoffice.androidlib.** { *; }
