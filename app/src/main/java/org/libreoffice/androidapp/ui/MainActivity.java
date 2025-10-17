package org.libreoffice.androidapp.ui;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.libreoffice.androidapp.R;

public class MainActivity extends AppCompatActivity {

    private EditText uriEditText;
    private Button submitButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Ánh xạ các view từ layout XML
        uriEditText = findViewById(R.id.uriEditText);
        submitButton = findViewById(R.id.submitButton);

        // Thiết lập sự kiện cho nút Submit
        setupSubmitButton();
    }

    private void setupSubmitButton() {
        submitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String uriString = uriEditText.getText().toString().trim();

                if (uriString.isEmpty()) {
                    Toast.makeText(MainActivity.this, "Vui lòng nhập URI!", Toast.LENGTH_SHORT).show();
                    return;
                }

                try {
                    Uri uri = Uri.parse(uriString);

                    // Gọi UtilsOffice.open() để mở file
                    UtilsOffice.open(MainActivity.this, uri);

                } catch (Exception e) {
                    Toast.makeText(MainActivity.this,
                        "URI không hợp lệ: " + e.getMessage(),
                        Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == LibreOfficeUIActivity.LO_ACTIVITY_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                Toast.makeText(this, "File đã được xử lý thành công!", Toast.LENGTH_SHORT).show();
            } else if (resultCode == Activity.RESULT_CANCELED) {
                Toast.makeText(this, "Người dùng đã hủy thao tác.", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
