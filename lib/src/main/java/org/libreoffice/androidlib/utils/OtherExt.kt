package org.libreoffice.androidlib.utils

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.util.Log
import org.libreoffice.androidlib.BuildConfig
import org.libreoffice.androidlib.LOActivity

object OtherExt {

    /** Build Intent to edit a Uri using the new multi-process architecture.  */
    fun getIntentToEdit(activity: Activity, uri: Uri?): Intent {
        val i = Intent(Intent.ACTION_EDIT, uri)
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        i.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        val componentName =
            ComponentName(activity.getPackageName(), LOActivity::class.java.getName())
        i.setComponent(componentName)

        return i
    }

    fun Any.logD(log: String) {
        if (BuildConfig.DEBUG) {
            Log.d(this::class.java.simpleName, log)
        }
    }
}