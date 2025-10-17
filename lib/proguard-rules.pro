# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
-keepclassmembers class org.libreoffice.androidlib.LOActivity {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep JNI methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all classes in the main package
-keep class org.libreoffice.androidlib.** { *; }

# Keep WebView related classes
-keep class android.webkit.** { *; }
-keep class androidx.webkit.** { *; }

# Keep classes that extend Activity
-keep class * extends android.app.Activity { *; }

# Keep classes that extend Fragment
-keep class * extends androidx.fragment.app.Fragment { *; }

# Keep all public and protected methods in public classes
-keepclassmembers class * {
    public protected <methods>;
}

# Keep all fields in public classes
-keepclassmembers class * {
    public protected <fields>;
}

# Keep Serializable classes
-keep class * implements java.io.Serializable { *; }

# Keep classes needed for Java 11
-keep class java.lang.invoke.StringConcatFactory { *; }
-keep class java.lang.invoke.MethodHandle { *; }
-keep class java.lang.invoke.MethodHandles { *; }
-keep class java.lang.invoke.MethodHandles$Lookup { *; }
-keep class java.lang.invoke.MethodType { *; }
-keep class java.util.concurrent.ForkJoinPool { *; }
-keep class java.util.concurrent.ForkJoinTask { *; }
-keep class java.util.concurrent.ForkJoinWorkerThread { *; }
-keep class java.util.concurrent.RecursiveAction { *; }
-keep class java.util.concurrent.RecursiveTask { *; }

# Keep all invoke related classes
-keep class java.lang.invoke.** { *; }
-keep class java.util.concurrent.** { *; }

# Keep Kotlin metadata for proper reflection
-keep class kotlin.Metadata { *; }
-keep class kotlin.reflect.** { *; }

# Keep all classes that might use string concatenation
-keepclasseswithmembers class * {
    public static ** main(java.lang.String[]);
}

# Keep specific classes mentioned in the error
-dontwarn java.lang.invoke.StringConcatFactory
-dontwarn java.lang.invoke.MethodHandle
-dontwarn java.lang.invoke.MethodHandles
-dontwarn java.lang.invoke.MethodHandles$Lookup
-dontwarn java.lang.invoke.MethodType

# Keep Android classes that might use invoke
-keep class android.** { *; }
-keep class androidx.** { *; }
