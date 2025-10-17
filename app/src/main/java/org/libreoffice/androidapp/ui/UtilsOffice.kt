package org.libreoffice.androidapp.ui

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import org.libreoffice.androidlib.LOActivity

object UtilsOffice {
    const val TAG: String = "UtilsOffice"

    /** Start editing of the given Uri.  */
    @JvmStatic
    fun open(activity: Activity, uri: Uri?) {
        if (uri == null) return
        val i = getIntentToEdit(activity, uri)
        activity.startActivity(i)
    }


    /** Build Intent to edit a Uri using the new multi-process architecture.  */
    fun getIntentToEdit(activity: Activity, uri: Uri?): Intent {
        val i = Intent(Intent.ACTION_EDIT, uri)
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        i.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)

        val packageName = activity.getPackageName()
        val componentName = ComponentName(packageName, LOActivity::class.java.getName())
        i.setComponent(componentName)

        return i
    }
}
