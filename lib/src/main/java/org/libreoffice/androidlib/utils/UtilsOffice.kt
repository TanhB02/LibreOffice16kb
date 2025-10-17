package org.libreoffice.androidlib.utils

import android.app.Activity
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import org.libreoffice.androidlib.BuildConfig
import org.libreoffice.androidlib.LOActivity
import org.libreoffice.androidlib.utils.OtherExt.getIntentToEdit
import org.libreoffice.androidlib.utils.OtherExt.logD
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream

object UtilsOffice {
    const val XLSX = "xlsx"
    const val DOCX = "docx"
    const val PPTX = "pptx"

    @JvmStatic
    fun Activity.openFile( uri: Uri?) {
        logD("TANHXXXX =>>>>> uri:${uri}")
        if (uri == null) return
        val i = getIntentToEdit(this, uri)
        this.startActivity(i)
    }

    fun Context.createNewFile(uri: Uri, fileType: String? = XLSX) {
        class CreateThread : Thread() {
            override fun run() {
                var templateFileStream: InputStream? = null
                var newFileStream: OutputStream? = null
                try {
                    templateFileStream = this@createNewFile.getAssets().open("templates/untitled." + fileType)
                    newFileStream = this@createNewFile.getContentResolver().openOutputStream(uri)
                    val buffer = ByteArray(1024)
                    var length: Int
                    while ((templateFileStream.read(buffer).also { length = it }) > 0) {
                        newFileStream!!.write(buffer, 0, length)
                    }
                } catch (e: IOException) {
                    e.printStackTrace()
                } finally {
                    try {
                        templateFileStream!!.close()
                        newFileStream!!.close()
                    } catch (e: IOException) {
                        e.printStackTrace()
                    }
                }
            }
        }

        val thread = CreateThread()
        thread.run()
        try {
            thread.join()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }


}