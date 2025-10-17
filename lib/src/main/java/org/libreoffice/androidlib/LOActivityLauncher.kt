package org.libreoffice.androidlib

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.util.Log
import androidx.localbroadcastmanager.content.LocalBroadcastManager


class LOActivityLauncher : Activity() {
    private var finishReceiver: BroadcastReceiver? = null
    private val isFinishing = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "LOActivityLauncher created")

        finishReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent) {
                if (LOActivityService.Companion.ACTION_LO_ACTIVITY_FINISHED == intent.getAction()) {
                    Log.d(TAG, "LOActivity finished, closing launcher")
                    finish()
                }
            }
        }

        LocalBroadcastManager.getInstance(this).registerReceiver(
            finishReceiver!!,
            IntentFilter(LOActivityService.Companion.ACTION_LO_ACTIVITY_FINISHED)
        )

        startLOActivity()
    }

    private fun startLOActivity() {
        val intent = getIntent()
        if (intent == null || intent.getData() == null) {
            Log.e(TAG, "No document URI provided")
            finish()
            return
        }

        val documentUri = intent.getData()
        val isEditable =
            intent.getBooleanExtra(LOActivityService.Companion.EXTRA_IS_EDITABLE, false)

        Log.d(TAG, "Starting LOActivity for document: " + documentUri + ", editable: " + isEditable)

        val serviceIntent = Intent(this, LOActivityService::class.java)
        serviceIntent.setAction(LOActivityService.Companion.ACTION_START_LO_ACTIVITY)
        serviceIntent.setData(documentUri)
        serviceIntent.putExtra(LOActivityService.Companion.EXTRA_IS_EDITABLE, isEditable)

        startService(serviceIntent)

        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "LOActivityLauncher destroyed")

        if (finishReceiver != null) {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(finishReceiver!!)
        }
    }

    companion object {
        private const val TAG = "LOActivityLauncher"
    }
}
