package org.libreoffice.androidapp.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import org.libreoffice.androidapp.R
import org.libreoffice.androidapp.databinding.ActivityMainBinding
import org.libreoffice.androidlib.utils.*
import org.libreoffice.androidlib.utils.UtilsOffice.openFile

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setupSubmitButton()
    }

    private fun setupSubmitButton() {
        binding.submitButton.setOnClickListener(object : View.OnClickListener {
            override fun onClick(v: View?) {
                val uriString = binding.uriEditText.text.toString().trim()

                if (uriString.isEmpty()) {
                    Toast.makeText(this@MainActivity, "Vui lòng nhập URI!", Toast.LENGTH_SHORT)
                        .show()
                    return
                }

                try {
                    val uri = Uri.parse(uriString)
                    openFile( uri)
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
