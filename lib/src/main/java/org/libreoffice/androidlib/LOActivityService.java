/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.libreoffice.androidlib;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.IBinder;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

/**
 * Service để quản lý LOActivity trong process riêng biệt
 * Điều này giúp tránh việc kill process chính khi đóng file
 */
public class LOActivityService extends Service {
    private static final String TAG = "LOActivityService";

    // Broadcast actions
    public static final String ACTION_START_LO_ACTIVITY = "org.libreoffice.androidlib.action.START_LO_ACTIVITY";
    public static final String ACTION_STOP_LO_ACTIVITY = "org.libreoffice.androidlib.action.STOP_LO_ACTIVITY";
    public static final String ACTION_LO_ACTIVITY_FINISHED = "org.libreoffice.androidlib.action.LO_ACTIVITY_FINISHED";

    // Broadcast data keys
    public static final String EXTRA_DOCUMENT_URI = "document_uri";
    public static final String EXTRA_IS_EDITABLE = "is_editable";

    private LOActivity currentLOActivity = null;
    private BroadcastReceiver activityFinishedReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "LOActivityService created");

        // Đăng ký receiver để lắng nghe khi LOActivity kết thúc
        activityFinishedReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (LOActivity.LO_ACTIVITY_BROADCAST.equals(intent.getAction())) {
                    String event = intent.getStringExtra(LOActivity.LO_ACTION_EVENT);
                    Log.d(TAG, "Received event from LOActivity: " + event);

                    if ("BYE".equals(event) || "SAVE".equals(event)) {
                        // Đóng LOActivity nếu đang chạy
                        closeCurrentLOActivity();

                        // LOActivity đã đóng, gửi broadcast về main process
                        Intent finishIntent = new Intent(ACTION_LO_ACTIVITY_FINISHED);
                        LocalBroadcastManager.getInstance(LOActivityService.this).sendBroadcast(finishIntent);

                        // Dừng service sau một khoảng thời gian ngắn
                        stopSelfDelayed();
                    }
                }
            }
        };

        LocalBroadcastManager.getInstance(this).registerReceiver(
                activityFinishedReceiver,
                new IntentFilter(LOActivity.LO_ACTIVITY_BROADCAST)
        );
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "onStartCommand called with action: " + (intent != null ? intent.getAction() : "null"));

        if (intent != null) {
            String action = intent.getAction();

            switch (action) {
                case ACTION_START_LO_ACTIVITY:
                    handleStartLOActivity(intent);
                    break;
                case ACTION_STOP_LO_ACTIVITY:
                    handleStopLOActivity();
                    break;
                default:
                    Log.w(TAG, "Unknown action: " + action);
                    break;
            }
        }

        // Service sẽ tiếp tục chạy cho đến khi được dừng explicitly
        return START_STICKY;
    }

    private void handleStartLOActivity(Intent intent) {
        if (currentLOActivity != null) {
            Log.w(TAG, "LOActivity is already running, stopping current instance");
            currentLOActivity.finishWithProgress();
            currentLOActivity = null;
        }

        // Tạo intent để khởi chạy LOActivity
        Intent loActivityIntent = new Intent(this, LOActivity.class);
        loActivityIntent.setData(intent.getData());
        loActivityIntent.setAction(Intent.ACTION_VIEW);
        loActivityIntent.putExtras(intent.getExtras());

        // Khởi chạy LOActivity
        loActivityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(loActivityIntent);

        Log.d(TAG, "Started LOActivity for document: " +
                (intent.getData() != null ? intent.getData().toString() : "null"));
    }

    private void handleStopLOActivity() {
        Log.d(TAG, "Stopping LOActivity");

        closeCurrentLOActivity();

        // Dừng service
        stopSelf();
    }

    private void closeCurrentLOActivity() {
        if (currentLOActivity != null) {
            currentLOActivity.finishWithProgress();
            currentLOActivity = null;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "LOActivityService destroyed");

        // Hủy đăng ký receiver
        if (activityFinishedReceiver != null) {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(activityFinishedReceiver);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        // Không cần bind service
        return null;
    }

    private void stopSelfDelayed() {
        // Đợi một chút để đảm bảo LOActivity đã thực sự đóng xong
        new android.os.Handler().postDelayed(() -> {
            if (currentLOActivity == null) {
                Log.d(TAG, "Stopping service after LOActivity finished");
                stopSelf();
            }
        }, 1000);
    }
}
