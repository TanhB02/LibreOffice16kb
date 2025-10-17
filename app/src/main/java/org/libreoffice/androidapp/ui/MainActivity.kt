package org.libreoffice.androidapp.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import org.libreoffice.androidapp.R
import org.libreoffice.androidapp.ui.UtilsOffice.open

class MainActivity : AppCompatActivity() {
    private var uriEditText: EditText? = null
    private var submitButton: Button? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Ánh xạ các view từ layout XML
        uriEditText = findViewById<EditText>(R.id.uriEditText)
        submitButton = findViewById<Button>(R.id.submitButton)

        // Thiết lập sự kiện cho nút Submit
        setupSubmitButton()
    }

    private fun setupSubmitButton() {
        submitButton!!.setOnClickListener(object : View.OnClickListener {
            override fun onClick(v: View?) {
                val uriString = uriEditText!!.getText().toString().trim { it <= ' ' }

                if (uriString.isEmpty()) {
                    Toast.makeText(this@MainActivity, "Vui lòng nhập URI!", Toast.LENGTH_SHORT)
                        .show()
                    return
                }

                try {
                    val uri = Uri.parse(uriString)

                    // Gọi UtilsOffice.open() để mở file
                    open(this@MainActivity, uri)
                } catch (e: Exception) {
                    Toast.makeText(
                        this@MainActivity,
                        "URI không hợp lệ: " + e.message,
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        })
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == LibreOfficeUIActivity.LO_ACTIVITY_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                Toast.makeText(this, "File đã được xử lý thành công!", Toast.LENGTH_SHORT).show()
            } else if (resultCode == RESULT_CANCELED) {
                Toast.makeText(this, "Người dùng đã hủy thao tác.", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
