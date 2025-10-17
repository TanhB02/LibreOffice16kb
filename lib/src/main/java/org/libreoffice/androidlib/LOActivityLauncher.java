/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.libreoffice.androidlib;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

/**
 * Wrapper activity để khởi chạy LOActivity thông qua service
 * Điều này giúp tách biệt LOActivity khỏi main process
 */
public class LOActivityLauncher extends Activity {
    private static final String TAG = "LOActivityLauncher";

    private BroadcastReceiver finishReceiver;
    private boolean isFinishing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "LOActivityLauncher created");

        // Đăng ký receiver để lắng nghe khi LOActivity kết thúc
        finishReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (LOActivityService.ACTION_LO_ACTIVITY_FINISHED.equals(intent.getAction())) {
                    Log.d(TAG, "LOActivity finished, closing launcher");
                    finish();
                }
            }
        };

        LocalBroadcastManager.getInstance(this).registerReceiver(
                finishReceiver,
                new IntentFilter(LOActivityService.ACTION_LO_ACTIVITY_FINISHED)
        );

        // Khởi chạy LOActivity thông qua service
        startLOActivity();
    }

    private void startLOActivity() {
        Intent intent = getIntent();
        if (intent == null || intent.getData() == null) {
            Log.e(TAG, "No document URI provided");
            finish();
            return;
        }

        Uri documentUri = intent.getData();
        boolean isEditable = intent.getBooleanExtra(LOActivityService.EXTRA_IS_EDITABLE, false);

        Log.d(TAG, "Starting LOActivity for document: " + documentUri + ", editable: " + isEditable);

        // Tạo intent để khởi chạy service
        Intent serviceIntent = new Intent(this, LOActivityService.class);
        serviceIntent.setAction(LOActivityService.ACTION_START_LO_ACTIVITY);
        serviceIntent.setData(documentUri);
        serviceIntent.putExtra(LOActivityService.EXTRA_IS_EDITABLE, isEditable);

        // Khởi chạy service
        startService(serviceIntent);

        // Finish ngay lập tức vì service sẽ quản lý LOActivity
        // LOActivity sẽ được khởi chạy bởi service
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "LOActivityLauncher destroyed");

        if (finishReceiver != null) {
            LocalBroadcastManager.getInstance(this).unregisterReceiver(finishReceiver);
        }
    }
}
