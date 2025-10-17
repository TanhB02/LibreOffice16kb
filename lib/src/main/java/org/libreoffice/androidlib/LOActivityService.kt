/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */ /*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package org.libreoffice.androidlib

import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.IBinder
import android.util.Log
import androidx.localbroadcastmanager.content.LocalBroadcastManager

/**
 * Service để quản lý LOActivity trong process riêng biệt
 * Điều này giúp tránh việc kill process chính khi đóng file
 */
class LOActivityService : Service() {
    private var currentLOActivity: LOActivity? = null
    private var activityFinishedReceiver: BroadcastReceiver? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "LOActivityService created")

        activityFinishedReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent) {
                if (LOActivity.LO_ACTIVITY_BROADCAST == intent.getAction()) {
                    val event = intent.getStringExtra(LOActivity.LO_ACTION_EVENT)
                    Log.d(TAG, "Received event from LOActivity: " + event)

                    if ("BYE" == event || "SAVE" == event) {
                        closeCurrentLOActivity()
                        val finishIntent: Intent = Intent(ACTION_LO_ACTIVITY_FINISHED)
                        LocalBroadcastManager.getInstance(this@LOActivityService)
                            .sendBroadcast(finishIntent)

                        stopSelfDelayed()
                    }
                }
            }
        }

        LocalBroadcastManager.getInstance(this).registerReceiver(
            activityFinishedReceiver!!,
            IntentFilter(LOActivity.LO_ACTIVITY_BROADCAST)
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(
            TAG,
            "onStartCommand called with action: " + (if (intent != null) intent.getAction() else "null")
        )

        if (intent != null) {
            val action = intent.getAction()

            when (action) {
                ACTION_START_LO_ACTIVITY -> handleStartLOActivity(intent)
                ACTION_STOP_LO_ACTIVITY -> handleStopLOActivity()
                else -> Log.w(TAG, "Unknown action: " + action)
            }
        }

        return START_STICKY
    }

    private fun handleStartLOActivity(intent: Intent) {
        if (currentLOActivity != null) {
            Log.w(TAG, "LOActivity is already running, stopping current instance")
            currentLOActivity!!.finishWithProgress()
            currentLOActivity = null
        }

        val loActivityIntent = Intent(this, LOActivity::class.java)
        loActivityIntent.setData(intent.getData())
        loActivityIntent.setAction(Intent.ACTION_VIEW)
        loActivityIntent.putExtras(intent.getExtras()!!)

        loActivityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(loActivityIntent)

        Log.d(
            TAG, "Started LOActivity for document: " +
                    (if (intent.getData() != null) intent.getData().toString() else "null")
        )
    }

    private fun handleStopLOActivity() {
        Log.d(TAG, "Stopping LOActivity")

        closeCurrentLOActivity()

        stopSelf()
    }

    private fun closeCurrentLOActivity() {
        if (currentLOActivity != null) {
            currentLOActivity!!.finishWithProgress()
            currentLOActivity = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "LOActivityService destroyed")

        if (activityFinishedReceiver != null) {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(activityFinishedReceiver!!)
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun stopSelfDelayed() {
        Handler().postDelayed(Runnable {
            if (currentLOActivity == null) {
                Log.d(TAG, "Stopping service after LOActivity finished")
                stopSelf()
            }
        }, 1000)
    }

    companion object {
        private const val TAG = "LOActivityService"

        const val ACTION_START_LO_ACTIVITY: String =
            "org.libreoffice.androidlib.action.START_LO_ACTIVITY"
        const val ACTION_STOP_LO_ACTIVITY: String =
            "org.libreoffice.androidlib.action.STOP_LO_ACTIVITY"
        const val ACTION_LO_ACTIVITY_FINISHED: String =
            "org.libreoffice.androidlib.action.LO_ACTIVITY_FINISHED"

        const val EXTRA_DOCUMENT_URI: String = "document_uri"
        const val EXTRA_IS_EDITABLE: String = "is_editable"
    }
}
