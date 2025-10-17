
package org.libreoffice.androidlib

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.ContentResolver
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.res.AssetManager
import android.content.res.Configuration
import android.database.Cursor
import android.net.Uri
import android.os.AsyncTask
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.preference.PreferenceManager
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintManager
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.inputmethod.InputMethodManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebChromeClient.FileChooserParams
import android.webkit.WebView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import org.json.JSONException
import org.json.JSONObject
import org.libreoffice.androidlib.lok.LokClipboardData
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileNotFoundException
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.io.UnsupportedEncodingException
import java.net.URI
import java.net.URISyntaxException
import java.nio.ByteBuffer
import java.nio.channels.Channels
import java.nio.channels.FileChannel
import java.nio.channels.ReadableByteChannel
import java.nio.charset.Charset

class LOActivity : AppCompatActivity() {
    private var mTempFile: File? = null

    private var providerId = 0
    private var mActivity: Activity? = null

    /** Unique number identifying this app + document. */
    private var loadDocumentMillis: Long = 0

    private var documentUri: URI? = null

    private var urlToLoad: String? = null
    private var mWebView: COWebView? = null
    private var mMobileSocket: MobileSocket? = null
    private var sPrefs: SharedPreferences? = null
    private var mMainHandler: Handler? = null

    private var isDocEditable = true
    private var isDocDebuggable = BuildConfig.DEBUG
    private var documentLoaded = false

    private var clipboardManager: ClipboardManager? = null
    private var clipData: ClipData? = null
    private var nativeMsgThread: Thread? = null
    private var nativeHandler: Handler? = null
    private var nativeLooper: Looper? = null
    private var savedInstanceState: Bundle? = null

    private var mProgressDialog: ProgressDialog? = null

    /** In case the mobile-wizard is visible, we have to intercept the Android's Back button.  */
    private var mMobileWizardVisible = false
    private var mIsEditModeActive = false

    private var valueCallback: ValueCallback<Array<Uri?>?>? = null

    private val mainHandler: Handler
        get() {
            if (mMainHandler == null) {
                mMainHandler = Handler(getMainLooper())
            }
            return mMainHandler!!
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        this.savedInstanceState = savedInstanceState
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        sPrefs = PreferenceManager.getDefaultSharedPreferences(getApplicationContext())

        setContentView(R.layout.lolib_activity_main)
        mProgressDialog = ProgressDialog(this)
        this.mActivity = this
        init()
    }

    /** Initialize the app - copy the assets and create the UI.  */
    private fun init() {
        if (sPrefs!!.getString(ASSETS_EXTRACTED_GIT_COMMIT, "") == BuildConfig.GIT_COMMIT) {
            // all is fine, we have already copied the assets
            initUI()
            return
        }

        mProgressDialog!!.indeterminate(R.string.preparing_for_the_first_start_after_an_update)

        object : AsyncTask<Void?, Void?, Void?>() {
            override fun doInBackground(vararg voids: Void?): Void? {
                // copy the new assets
                if (copyFromAssets(getAssets(), "unpack", getApplicationInfo().dataDir)) {
                    sPrefs!!.edit().putString(ASSETS_EXTRACTED_GIT_COMMIT, BuildConfig.GIT_COMMIT)
                        .apply()
                }
                return null
            }

            override fun onPostExecute(aVoid: Void?) {
                initUI()
            }
        }.execute()
    }

    /** Actual initialization of the UI.  */
    private fun initUI() {
        isDocDebuggable =
            sPrefs!!.getBoolean(KEY_ENABLE_SHOW_DEBUG_INFO, false) && BuildConfig.DEBUG

        if (getIntent().getData() != null) {
            if (getIntent().getData()!!.getScheme() == ContentResolver.SCHEME_CONTENT) {
                isDocEditable = true

                // is it read-only?
                if ((getIntent().getFlags() and Intent.FLAG_GRANT_WRITE_URI_PERMISSION) == 0) {
                    isDocEditable = false
                    Log.d(TAG, "Disabled editing: Read-only")
                    Toast.makeText(
                        this,
                        getResources().getString(R.string.temp_file_saving_disabled),
                        Toast.LENGTH_SHORT
                    ).show()
                }

                // turns out that on ChromeOS, it is not possible to save back
                // to Google Drive; detect it already here to avoid disappointment
                // also the volumeprovider does not work for saving back,
                // which is much more serious :-(
                if (isDocEditable && (getIntent().getData().toString()
                        .startsWith("content://org.chromium.arc.chromecontentprovider/externalfile") ||
                            getIntent().getData().toString()
                                .startsWith("content://org.chromium.arc.volumeprovider/"))
                ) {
                    isDocEditable = false
                    Log.d(TAG, "Disabled editing: Chrome OS unsupported content providers")
                    Toast.makeText(
                        this,
                        getResources().getString(R.string.file_chromeos_read_only),
                        Toast.LENGTH_LONG
                    ).show()
                }

                if (copyFileToTemp() && mTempFile != null) {
                    documentUri = mTempFile!!.toURI()
                    urlToLoad = documentUri.toString()
                    Log.d(TAG, "SCHEME_CONTENT: getPath(): " + getIntent().getData()!!.getPath())
                } else {
                    Log.e(TAG, "couldn't create temporary file from " + getIntent().getData())
                    Toast.makeText(this, R.string.cant_open_the_document, Toast.LENGTH_SHORT).show()
                    finish()
                }
            } else if (getIntent().getData()!!.getScheme() == ContentResolver.SCHEME_FILE) {
                isDocEditable = true
                urlToLoad = getIntent().getData().toString()
                Log.d(TAG, "SCHEME_FILE: getPath(): " + getIntent().getData()!!.getPath())
                // Gather data to rebuild IFile object later
                providerId = getIntent().getIntExtra(
                    "org.libreoffice.document_provider_id", 0
                )
                documentUri = getIntent().getSerializableExtra(
                    "org.libreoffice.document_uri"
                ) as URI?
            }
        } else if (savedInstanceState != null) {
            getIntent().setAction(Intent.ACTION_VIEW)
                .setData(Uri.parse(savedInstanceState!!.getString(KEY_INTENT_URI)))
            urlToLoad = getIntent().getData().toString()
            providerId = savedInstanceState!!.getInt(KEY_PROVIDER_ID)
            if (savedInstanceState!!.getString(KEY_DOCUMENT_URI) != null) {
                try {
                    documentUri = URI(savedInstanceState!!.getString(KEY_DOCUMENT_URI))
                    urlToLoad = documentUri.toString()
                } catch (e: URISyntaxException) {
                    e.printStackTrace()
                }
            }
            isDocEditable = savedInstanceState!!.getBoolean(KEY_IS_EDITABLE)
        } else {
            //User can't reach here but if he/she does then
            Toast.makeText(this, getString(R.string.failed_to_load_file), Toast.LENGTH_SHORT).show()
            finish()
        }
        // some types don't have export filter so we cannot edit them
        // only set it to false if it returns false otherwise it can break previous controls
        if (!canDocumentBeExported()) isDocEditable = false
        if (mTempFile != null) {
            mWebView = findViewById<View?>(R.id.browser) as COWebView?
            mMobileSocket = mWebView!!.getWebViewClient().getMobileSocket()

            val webSettings = mWebView!!.getSettings()
            webSettings.setJavaScriptEnabled(true)
            mWebView!!.addJavascriptInterface(this, "COOLMessageHandler")

            webSettings.setDomStorageEnabled(true)

            // allow debugging (when building the debug version); see details in
            // https://developers.google.com/web/tools/chrome-devtools/remote-debugging/webviews
            val isChromeDebugEnabled = sPrefs!!.getBoolean("ENABLE_CHROME_DEBUGGING", false)
            if ((getApplicationInfo().flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0 || isChromeDebugEnabled) {
                WebView.setWebContentsDebuggingEnabled(true)
            }

            this.mainHandler

            clipboardManager = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
            nativeMsgThread = Thread(object : Runnable {
                override fun run() {
                    Looper.prepare()
                    nativeLooper = Looper.myLooper()
                    nativeHandler = Handler(nativeLooper!!)
                    Looper.loop()
                }
            })
            nativeMsgThread!!.start()

            mWebView!!.setWebChromeClient(object : WebChromeClient() {
                override fun onShowFileChooser(
                    mWebView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri?>?>?,
                    fileChooserParams: FileChooserParams
                ): Boolean {
                    if (valueCallback != null) {
                        valueCallback!!.onReceiveValue(null)
                        valueCallback = null
                    }

                    valueCallback = filePathCallback
                    val intent = fileChooserParams.createIntent()

                    try {
                        intent.setType("image/*")
                        startActivityForResult(intent, REQUEST_SELECT_IMAGE_FILE)
                    } catch (e: ActivityNotFoundException) {
                        valueCallback = null
                        Toast.makeText(
                            this@LOActivity,
                            getString(R.string.cannot_open_file_chooser),
                            Toast.LENGTH_LONG
                        ).show()
                        return false
                    }
                    return true
                }
            })

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU && ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Log.i(TAG, "asking for read storage permission")
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf<String>(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    PERMISSION_WRITE_EXTERNAL_STORAGE
                )
            } else {
                loadDocument()
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        Log.i(TAG, "onNewIntent")

        if (documentLoaded) {
            postMobileMessageNative("save dontTerminateEdit=1 dontSaveIfUnmodified=1")
        }

        val finalIntent = intent
        mProgressDialog!!.indeterminate(R.string.exiting)
        this.mainHandler.post(object : Runnable {
            override fun run() {
                documentLoaded = false
                postMobileMessageNative("BYE")
                //copyTempBackToIntent();
                runOnUiThread(object : Runnable {
                    override fun run() {
                        mProgressDialog!!.dismiss()
                        setIntent(finalIntent)
                        init()
                    }
                })
            }
        })
        super.onNewIntent(intent)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString(KEY_INTENT_URI, getIntent().getData().toString())
        outState.putInt(KEY_PROVIDER_ID, providerId)
        if (documentUri != null) {
            outState.putString(KEY_DOCUMENT_URI, documentUri.toString())
        }
        //If this activity was opened via contentUri
        outState.putBoolean(KEY_IS_EDITABLE, isDocEditable)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String?>,
        grantResults: IntArray
    ) {
        when (requestCode) {
            PERMISSION_WRITE_EXTERNAL_STORAGE -> if (permissions.size > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                loadDocument()
            } else {
                Toast.makeText(
                    this,
                    getString(R.string.storage_permission_required),
                    Toast.LENGTH_SHORT
                ).show()
                finishAndRemoveTask()
            }

            else -> super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        }
    }

    /** When we get the file via a content: URI, we need to put it to a temp file.  */
    private fun copyFileToTemp(): Boolean {
        val contentResolver = getContentResolver()

        class CopyThread : Thread() {
            /** Whether copy operation was successful.  */
            var result = false
            override fun run() {
                var inputStream: InputStream? = null
                var outputStream: OutputStream? = null
                // CSV files need a .csv suffix to be opened in Calc.
                var suffix: String? = null
                var intentType = mActivity!!.getIntent().getType()
                if (mActivity!!.getIntent().getType() == null) {
                    intentType = this@LOActivity.mimeType
                }
                // K-9 mail uses the first, GMail uses the second variant.
                if ("text/comma-separated-values" == intentType || "text/csv" == intentType) suffix =
                    ".csv"
                else if ("application/pdf" == intentType) suffix = ".pdf"
                else if ("application/vnd.ms-excel" == intentType) suffix = ".xls"
                else if ("application/vnd.ms-powerpoint" == intentType) suffix = ".ppt"
                try {
                    try {
                        val uri = mActivity!!.getIntent().getData()
                        inputStream = contentResolver.openInputStream(uri!!)

                        mTempFile =
                            File.createTempFile("LibreOffice", suffix, mActivity!!.getCacheDir())
                        outputStream = FileOutputStream(mTempFile)

                        val buffer = ByteArray(1024)
                        var length: Int
                        var bytes: Long = 0
                        while ((inputStream!!.read(buffer).also { length = it }) != -1) {
                            outputStream.write(buffer, 0, length)
                            bytes += length.toLong()
                        }

                        Log.i(
                            TAG,
                            "Success copying " + bytes + " bytes from " + uri + " to " + mTempFile
                        )
                    } finally {
                        if (inputStream != null) inputStream.close()
                        if (outputStream != null) outputStream.close()
                        result = true
                    }
                } catch (e: FileNotFoundException) {
                    Log.e(TAG, "file not found: " + e.message)
                    result = false
                } catch (e: IOException) {
                    Log.e(TAG, "exception: " + e.message)
                    result = false
                }
            }
        }

        val copyThread = CopyThread()
        copyThread.start()
        try {
            // wait for copy operation to finish
            // NOTE: might be useful to add some indicator in UI for long copy operations involving network...
            copyThread.join()
        } catch (e: InterruptedException) {
            e.printStackTrace()
        }
        return copyThread.result
    }

    /** Check that we have created a temp file, and if yes, copy it back to the content: URI.  */
    private fun copyTempBackToIntent() {
        if (!isDocEditable || mTempFile == null || getIntent().getData() == null || (getIntent().getData()!!
                .getScheme() != ContentResolver.SCHEME_CONTENT)
        ) return

        val contentResolver = getContentResolver()
        try {
            val copyThread = Thread(object : Runnable {
                override fun run() {
                    var inputStream: InputStream? = null
                    var outputStream: OutputStream? = null
                    try {
                        try {
                            inputStream = FileInputStream(mTempFile)

                            val len = inputStream.available()
                            if (len <= 0)  // empty for some reason & do not write it back
                                return

                            val uri = getIntent().getData()
                            try {
                                outputStream = contentResolver.openOutputStream(uri!!, "wt")
                            } catch (e: FileNotFoundException) {
                                Log.i(
                                    TAG,
                                    "failed with the 'wt' mode, trying without: " + e.message
                                )
                                outputStream = contentResolver.openOutputStream(uri!!)
                            }

                            val buffer = ByteArray(1024)
                            var length: Int
                            var bytes: Long = 0
                            while ((inputStream.read(buffer).also { length = it }) != -1) {
                                outputStream!!.write(buffer, 0, length)
                                bytes += length.toLong()
                            }

                            Log.i(
                                TAG,
                                "Success copying " + bytes + " bytes from " + mTempFile + " to " + uri
                            )
                        } finally {
                            if (inputStream != null) inputStream.close()
                            if (outputStream != null) outputStream.close()
                        }
                    } catch (e: FileNotFoundException) {
                        Log.e(TAG, "file not found: " + e.message)
                    } catch (e: Exception) {
                        Log.e(TAG, "exception: " + e.message)
                    }
                }
            })
            copyThread.start()
            copyThread.join()
        } catch (e: Exception) {
            Log.i(TAG, "copyTempBackToIntent: " + e.message)
        }
    }

    override fun onResume() {
        super.onResume()
        Log.i(TAG, "onResume..")
    }

    override fun onPause() {
        // A Save similar to an autosave
        if (documentLoaded) postMobileMessageNative("save dontTerminateEdit=1 dontSaveIfUnmodified=1")

        super.onPause()
        Log.d(TAG, "onPause() - hinting to save, we might need to return to the doc")
    }

    override fun onDestroy() {
        if (!documentLoaded) {
            super.onDestroy()
            return
        }
        nativeLooper!!.quit()

        // Remove the webview from the hierarchy & destroy
        val viewGroup = mWebView!!.getParent() as ViewGroup?
        if (viewGroup != null) viewGroup.removeView(mWebView)
        mWebView!!.destroy()
        mWebView = null
        mMobileSocket = null

        // Most probably the native part has already got a 'BYE' from
        // finishWithProgress(), but it is actually better to send it twice
        // than never, so let's call it from here too anyway
        documentLoaded = false
        postMobileMessageNative("BYE")

        mProgressDialog!!.dismiss()

        super.onDestroy()
        Log.i(TAG, "onDestroy() - we know we are leaving the document")
    }

    public override fun onActivityResult(requestCode: Int, resultCode: Int, intent: Intent?) {
        var requestCode = requestCode
        super.onActivityResult(requestCode, resultCode, intent)
        if (resultCode != RESULT_OK) {
            if (requestCode == REQUEST_SELECT_IMAGE_FILE) {
                valueCallback!!.onReceiveValue(null)
                valueCallback = null
            }
            return
        }

        /*
            Copy is just save-as in general but with TakeOwnership.
            Meaning that we will switch to the copied (saved-as) document in the bg
            this way we don't need to reload the activity.
        */
        var requestCopy = false
        if (requestCode == REQUEST_COPY) {
            requestCopy = true
            if (this.mimeType == "text/plain") {
                requestCode = REQUEST_SAVEAS_ODT
            } else if (this.mimeType == "text/comma-separated-values") {
                requestCode = REQUEST_SAVEAS_ODS
            } else if (this.mimeType == "application/vnd.ms-excel.sheet.binary.macroenabled.12") {
                requestCode = REQUEST_SAVEAS_ODS
            } else {
                val filename = getFileName(true)
                val extension = filename!!.substring(filename.lastIndexOf('.') + 1)
                requestCode = getRequestIDForFormat(extension)
                assert(requestCode != 0)
            }
        }
        when (requestCode) {
            REQUEST_SELECT_IMAGE_FILE -> {
                if (valueCallback == null) return
                valueCallback!!.onReceiveValue(FileChooserParams.parseResult(resultCode, intent))
                valueCallback = null
                return
            }

            REQUEST_SAVEAS_PDF, REQUEST_SAVEAS_RTF, REQUEST_SAVEAS_ODT, REQUEST_SAVEAS_ODP, REQUEST_SAVEAS_ODS, REQUEST_SAVEAS_DOCX, REQUEST_SAVEAS_PPTX, REQUEST_SAVEAS_XLSX, REQUEST_SAVEAS_DOC, REQUEST_SAVEAS_PPT, REQUEST_SAVEAS_XLS, REQUEST_SAVEAS_EPUB -> {
                if (intent == null) {
                    return
                }
                val format = getFormatForRequestCode(requestCode)
                var _tempFile: File? = null
                if (format != null) {
                    var inputStream: InputStream? = null
                    var outputStream: OutputStream? = null
                    try {
                        val tempFile =
                            File.createTempFile("LibreOffice", "." + format, this.getCacheDir())
                        this@LOActivity.saveAs(
                            tempFile.toURI().toString(),
                            format,
                            if (requestCopy) "TakeOwnership" else null
                        )

                        inputStream = FileInputStream(tempFile)
                        try {
                            outputStream =
                                getContentResolver().openOutputStream(intent.getData()!!, "wt")
                        } catch (e: FileNotFoundException) {
                            Log.i(TAG, "failed with the 'wt' mode, trying without: " + e.message)
                            outputStream = getContentResolver().openOutputStream(intent.getData()!!)
                        }

                        val buffer = ByteArray(4096)
                        var len: Int
                        while ((inputStream.read(buffer).also { len = it }) != -1) {
                            outputStream!!.write(buffer, 0, len)
                        }
                        outputStream!!.flush()
                        _tempFile = tempFile
                    } catch (e: Exception) {
                        Toast.makeText(
                            this,
                            "Something went wrong while Saving as: " + e.message,
                            Toast.LENGTH_SHORT
                        ).show()
                        e.printStackTrace()
                    } finally {
                        try {
                            if (inputStream != null) inputStream.close()
                            if (outputStream != null) outputStream.close()
                        } catch (e: Exception) {
                        }
                    }
                    if (requestCopy == true) {
                        checkNotNull(_tempFile)
                        mTempFile = _tempFile
                        getIntent().setData(intent.getData())
                        /** add the document to recents  */
                        addIntentToRecents(intent)
                        // This will actually change the doc permission to write
                        // It's a toggle for blue edit button, but also changes permission
                        // Toggle is achieved by calling setPermission('edit') in javascript
                        callFakeWebsocketOnMessage("mobile: readonlymode")
                        isDocEditable = true
                    }
                    return
                }
            }
        }
        Toast.makeText(this, "Unknown request", Toast.LENGTH_LONG).show()
    }

    private fun addIntentToRecents(intent: Intent) {
        val treeFileUri = intent.getData()
        val recentPrefs = getSharedPreferences(EXPLORER_PREFS_KEY, MODE_PRIVATE)
        var recentList: String = recentPrefs.getString(RECENT_DOCUMENTS_KEY, "")!!
        recentList = treeFileUri.toString() + "\n" + recentList
        recentPrefs.edit().putString(RECENT_DOCUMENTS_KEY, recentList).apply()
    }

    private fun getFormatForRequestCode(requestCode: Int): String? {
        when (requestCode) {
            REQUEST_SAVEAS_PDF -> return "pdf"
            REQUEST_SAVEAS_RTF -> return "rtf"
            REQUEST_SAVEAS_ODT -> return "odt"
            REQUEST_SAVEAS_ODP -> return "odp"
            REQUEST_SAVEAS_ODS -> return "ods"
            REQUEST_SAVEAS_DOCX -> return "docx"
            REQUEST_SAVEAS_PPTX -> return "pptx"
            REQUEST_SAVEAS_XLSX -> return "xlsx"
            REQUEST_SAVEAS_DOC -> return "doc"
            REQUEST_SAVEAS_PPT -> return "ppt"
            REQUEST_SAVEAS_XLS -> return "xls"
            REQUEST_SAVEAS_EPUB -> return "epub"
        }
        return null
    }

    /** Show the Saving progress and finish the app.  */
    fun finishWithProgress() {
        if (!documentLoaded) {
            finishAndRemoveTask()
            return
        }
        mProgressDialog!!.indeterminate(R.string.exiting)

        // The 'BYE' takes a considerable amount of time, we need to post it
        // so that it starts after the saving progress is actually shown
        this.mainHandler.post(object : Runnable {
            override fun run() {
                documentLoaded = false
                postMobileMessageNative("BYE")

                //copyTempBackToIntent();
                runOnUiThread(object : Runnable {
                    override fun run() {
                        mProgressDialog!!.dismiss()
                    }
                })
                finishAndRemoveTask()
            }
        })
    }

    override fun onBackPressed() {
        if (!documentLoaded) {
            finishAndRemoveTask()
            return
        }

        if (mMobileWizardVisible) {
            // just return one level up in the mobile-wizard (or close it)
            callFakeWebsocketOnMessage("mobile: mobilewizardback")
            return
        } else if (mIsEditModeActive) {
            callFakeWebsocketOnMessage("mobile: readonlymode")
            return
        }

        finishWithProgress()
    }

    private fun loadDocument() {
        mProgressDialog!!.determinate(R.string.loading)

        // setup the COOLWSD
        val applicationInfo = getApplicationInfo()
        val dataDir = applicationInfo.dataDir
        Log.i(TAG, String.format("Initializing LibreOfficeKit, dataDir=%s\n", dataDir))

        val cacheDir = getApplication().getCacheDir().getAbsolutePath()
        val apkFile = getApplication().getPackageResourcePath()
        val assetManager = getResources().getAssets()
        val uiMode = if (this.isLargeScreen && !this.isChromeOS) "notebookbar" else "classic"
        val userName: String = this.prefs.getString(USER_NAME_KEY, "Guest User")!!
        createCOOLWSD(dataDir, cacheDir, apkFile, assetManager, urlToLoad, uiMode, userName)

        // trigger the load of the document
        var finalUrlToLoad = "file:///android_asset/dist/cool.html?file_path=" +
                urlToLoad + "&closebutton=1"

        // set the language
        val language = getResources().getConfiguration().locale.toLanguageTag()

        Log.i(TAG, "Loading with language:  " + language)

        finalUrlToLoad += "&lang=" + language

        if (isDocEditable) {
            finalUrlToLoad += "&permission=edit"
        } else {
            finalUrlToLoad += "&permission=readonly"
        }

        if (isDocDebuggable) {
            finalUrlToLoad += "&debug=false"
        }

        if (this.isLargeScreen && !this.isChromeOS) finalUrlToLoad += "&userinterfacemode=notebookbar"

        if (this.isDarkMode) {
            finalUrlToLoad += "&darkTheme=true"
        }

        // load the page
        mWebView!!.loadUrl(finalUrlToLoad)

        documentLoaded = true

        loadDocumentMillis = SystemClock.uptimeMillis()
    }

    private val isDarkMode: Boolean
        get() {
            val recentPrefs = getSharedPreferences(
                EXPLORER_PREFS_KEY,
                MODE_PRIVATE
            )
            val mode = recentPrefs.getInt(
                NIGHT_MODE_KEY,
                AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
            )
            when (mode) {
                -1 -> {
                    val darkModeFlag = getBaseContext().getResources()
                        .getConfiguration().uiMode and Configuration.UI_MODE_NIGHT_MASK
                    return darkModeFlag == Configuration.UI_MODE_NIGHT_YES
                }

                1 -> return false
                2 -> return true
            }
            return false
        }

    val isLargeScreen: Boolean
        /**
         * Used for determining tablets
         */
        get() = getResources().getBoolean(R.bool.isLargeScreen)

    val prefs: SharedPreferences
        get() = sPrefs!!

    /**
     * Initialize the COOLWSD to load 'loadFileURL'.
     */
    external fun createCOOLWSD(
        dataDir: String?,
        cacheDir: String?,
        apkFile: String?,
        assetManager: AssetManager?,
        loadFileURL: String?,
        uiMode: String?,
        userName: String?
    )

    /**
     * Passing messages from JS (instead of the websocket communication).
     */
    @JavascriptInterface
    fun postMobileMessage(message: String) {
        Log.d(TAG, "postMobileMessage: " + message)

        val messageAndParameterArray: Array<String?> = message.split(" ".toRegex(), limit = 2)
            .toTypedArray() // the command and the rest (that can potentially contain spaces too)

        if (beforeMessageFromWebView(messageAndParameterArray)) {
            postMobileMessageNative(message)
            afterMessageFromWebView(messageAndParameterArray)
        }
    }

    /**
     * Call the post method form C++
     */
    external fun postMobileMessageNative(message: String?)

    /**
     * Passing messages from JS (instead of the websocket communication).
     */
    @JavascriptInterface
    fun postMobileError(message: String?) {
        // TODO handle this
        Log.d(TAG, "postMobileError: " + message)
    }

    /**
     * Passing messages from JS (instead of the websocket communication).
     */
    @JavascriptInterface
    fun postMobileDebug(message: String?) {
        // TODO handle this
        Log.d(TAG, "postMobileDebug: " + message)
    }

    @get:JavascriptInterface
    val isChromeOS: Boolean
        /**
         * Provide the info that this app is actually running under ChromeOS - so
         * has to mostly look like on desktop.
         */
        get() = isChromeOS(this)

    /**
     * Passing message the other way around - from Java to the FakeWebSocket in JS.
     */
    fun callFakeWebsocketOnMessage(message: String) {
        rawCallFakeWebsocketOnMessage(message.toByteArray())
    }

    /**
     * Similar to callFakeWebsocketOnMessage but 'message' is instead any expression evaluable as
     * JavaScript. For example, you should use this to pass Base64ToArrayBuffer invocations to
     * the fake websocket
     */
    fun rawCallFakeWebsocketOnMessage(message: ByteArray) {
        try {
            mMobileSocket!!.queueSend(message, MobileSocket.Callback {
                mWebView!!.post(Runnable {
                    mWebView!!.loadUrl("javascript:window.socket.doSend();")
                })
            })
        } catch (e: InterruptedException) {
            throw RuntimeException(e)
        }

        // update progress bar when loading
        if (messageStartsWith(message, "progress")) {
            runOnUiThread(Runnable {
                val messageJSON: JSONObject?
                val messageID: String?
                val messageString: String?
                try {
                    messageString = String(message, charset("UTF-8"))
                } catch (e: UnsupportedEncodingException) {
                    throw RuntimeException(e)
                }

                val jsonStart = messageString.indexOf("{")
                if (jsonStart == -1) {
                    return@Runnable
                }

                try {
                    messageJSON = JSONObject(messageString.substring(jsonStart))
                    messageID = messageJSON.getString("id")
                } catch (e: JSONException) {
                    return@Runnable
                }

                if (messageID == "finish") {
                    mProgressDialog!!.dismiss()
                    return@Runnable
                }

                try {
                    val text = messageJSON.getString("text")
                    mProgressDialog!!.mTextView.setText(text)
                } catch (ignored: JSONException) {
                }
                try {
                    val progress = messageJSON.getInt("value")
                    mProgressDialog!!.determinateProgress(progress)
                } catch (ignored: JSONException) {
                }
            })
        } else if (messageStartsWith(message, "error:")) {
            runOnUiThread(Runnable { mProgressDialog!!.dismiss() })
        }
    }

    /**
     * return true to pass the message to the native part or false to block the message
     */
    private fun beforeMessageFromWebView(messageAndParam: Array<String?>): Boolean {
        when (messageAndParam[0]) {
            "BYE" -> {
                finishWithProgress()
                return false
            }

            "PRINT" -> {
                this.mainHandler.post(object : Runnable {
                    override fun run() {
                        this@LOActivity.initiatePrint()
                    }
                })
                return false
            }

            "SAVE" -> {
                copyTempBackToIntent()
                sendBroadcast(messageAndParam[0], messageAndParam[1])
                return false
            }

            "downloadas" -> {
                initiateSaveAs(messageAndParam[1]!!)
                return false
            }

            "uno" -> when (messageAndParam[1]) {
                ".uno:Paste" -> return performPaste()
                else -> {}
            }

            "DIM_SCREEN" -> {
                this.mainHandler.post(object : Runnable {
                    override fun run() {
                        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                    }
                })
                return false
            }

            "LIGHT_SCREEN" -> {
                this.mainHandler.post(object : Runnable {
                    override fun run() {
                        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                    }
                })
                return false
            }

            "MOBILEWIZARD" -> {
                when (messageAndParam[1]) {
                    "show" -> mMobileWizardVisible = true
                    "hide" -> mMobileWizardVisible = false
                }
                return false
            }

            "HYPERLINK" -> {
                val intent = Intent(Intent.ACTION_VIEW)
                intent.setData(Uri.parse(messageAndParam[1]))
                startActivity(intent)
                return false
            }

            "EDITMODE" -> {
                when (messageAndParam[1]) {
                    "on" -> {
                        mIsEditModeActive = true
                        // prompt for file conversion
                        requestForOdf()
                        if (mWebView != null && !FIRST_FOCUS) {
                            mWebView!!.requestFocus()
                            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager?
                            if (imm != null) {
                                imm.showSoftInput(mWebView, InputMethodManager.SHOW_IMPLICIT)
                            }
                            FIRST_FOCUS = true
                        }
                    }

                    "off" -> mIsEditModeActive = false
                }
                return false
            }

            "hideProgressbar" -> {
                if (mProgressDialog != null) mProgressDialog!!.dismiss()
                return false
            }

            "loadwithpassword" -> {
                mProgressDialog!!.determinate(R.string.loading)
                return true
            }

            "REQUESTFILECOPY" -> {
                requestForCopy()
                return false
            }
        }
        return true
    }

    private fun buildPrompt(
        mTitle: String?,
        mMessage: String,
        mPositiveBtnText: String?,
        mNegativeBtnText: String?,
        callback: DialogInterface.OnClickListener?
    ): AlertDialog.Builder {
        val builder = AlertDialog.Builder(this)
        builder.setTitle(mTitle)
        if (mMessage.length > 0) builder.setMessage(mMessage)
        builder.setPositiveButton(mPositiveBtnText, callback)
        builder.setNegativeButton(mNegativeBtnText, null)
        builder.setCancelable(false)
        return builder
    }

    private val mimeType: String?
        get() {
            val cR = getContentResolver()

            val data = getIntent().getData()
            if (data == null) return null

            return cR.getType(data)
        }

    private fun getFileName(withExtension: Boolean): String? {
        var cursor: Cursor? = null
        var filename: String? = null
        try {
            cursor = getContentResolver().query(getIntent().getData()!!, null, null, null, null)
            if (cursor != null && cursor.moveToFirst()) filename =
                cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
        } catch (e: Exception) {
            return null
        }
        if (!withExtension) filename = filename!!.substring(0, filename.lastIndexOf("."))
        return filename
    }

    private fun requestForCopy() {
        val canBeExported = canDocumentBeExported()
        buildPrompt(
            getString(R.string.ask_for_copy),
            "",
            if (canBeExported) getString(R.string.edit_copy) else getString(R.string.use_odf),
            getString(R.string.view_only),
            object : DialogInterface.OnClickListener {
                override fun onClick(dialogInterface: DialogInterface?, i: Int) {
                    if (canBeExported) Companion.createNewFileInputDialog(
                        mActivity!!, getFileName(true),
                        this@LOActivity.mimeType, REQUEST_COPY
                    )
                    else {
                        val extension = getOdfExtensionForDocType(this@LOActivity.mimeType)
                        if (extension != null) {
                            Companion.createNewFileInputDialog(
                                mActivity!!,
                                getFileName(false) + "." + extension,
                                getMimeForFormat(extension),
                                REQUEST_COPY
                            )
                        }
                    }
                }
            }).show()
    }

    // readonly formats here
    private fun canDocumentBeExported(): Boolean {
        if (this@LOActivity.mimeType == "application/vnd.ms-excel.sheet.binary.macroenabled.12") {
            return false
        }
        return true
    }

    private fun getOdfExtensionForDocType(mimeType: String?): String? {
        var extTemp: String? = null
        if (mimeType == "text/plain") {
            extTemp = "odt"
        } else if (mimeType == "text/comma-separated-values") {
            extTemp = "ods"
        } else if (mimeType == "application/vnd.ms-excel.sheet.binary.macroenabled.12") {
            extTemp = "ods"
        }
        return extTemp
    }

    private fun requestForOdf() {
        val extTemp = getOdfExtensionForDocType(this@LOActivity.mimeType)
        if (extTemp == null)  // this means we don't need to request for odf type.
            return
        val ext: String? = extTemp
        buildPrompt(
            getString(R.string.ask_for_convert_odf),
            getString(R.string.convert_odf_message),
            getString(R.string.use_odf),
            getString(R.string.use_text),
            object : DialogInterface.OnClickListener {
                override fun onClick(dialogInterface: DialogInterface?, i: Int) {
                    if (ext != null) {
                        Companion.createNewFileInputDialog(
                            mActivity!!, getFileName(false) + "." + ext, getMimeForFormat(
                                ext
                            ), REQUEST_COPY
                        )
                    }
                }
            }).show()
    }

    private fun initiateSaveAs(optionsString: String) {
        val optionsMap: MutableMap<String?, String?> = HashMap<String?, String?>()
        val options =
            optionsString.split(" ".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
        for (option in options) {
            val keyValue: Array<String?> = option.split("=".toRegex(), limit = 2).toTypedArray()
            if (keyValue.size == 2) optionsMap.put(keyValue[0], keyValue[1])
        }
        val format = optionsMap.get("format")
        val mime = getMimeForFormat(format!!)
        if (format != null && mime != null) {
            var filename = optionsMap.get("name")
            if (filename == null) filename = "document." + format
            val requestID = getRequestIDForFormat(format)

            val intent = Intent(Intent.ACTION_CREATE_DOCUMENT)
            intent.setType(mime)
            intent.putExtra(Intent.EXTRA_TITLE, filename)
            intent.putExtra(Intent.EXTRA_LOCAL_ONLY, false)
            val folder =
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
            intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, Uri.fromFile(folder).toString())
            intent.putExtra("android.content.extra.SHOW_ADVANCED", true)
            startActivityForResult(intent, requestID)
        }
    }

    private fun getRequestIDForFormat(format: String): Int {
        when (format) {
            "pdf" -> return REQUEST_SAVEAS_PDF
            "rtf" -> return REQUEST_SAVEAS_RTF
            "odt" -> return REQUEST_SAVEAS_ODT
            "odp" -> return REQUEST_SAVEAS_ODP
            "ods" -> return REQUEST_SAVEAS_ODS
            "docx" -> return REQUEST_SAVEAS_DOCX
            "pptx" -> return REQUEST_SAVEAS_PPTX
            "xlsx" -> return REQUEST_SAVEAS_XLSX
            "doc" -> return REQUEST_SAVEAS_DOC
            "ppt" -> return REQUEST_SAVEAS_PPT
            "xls" -> return REQUEST_SAVEAS_XLS
            "epub" -> return REQUEST_SAVEAS_EPUB
        }
        return 0
    }

    private fun getMimeForFormat(format: String): String? {
        when (format) {
            "pdf" -> return "application/pdf"
            "rtf" -> return "text/rtf"
            "odt" -> return "application/vnd.oasis.opendocument.text"
            "odp" -> return "application/vnd.oasis.opendocument.presentation"
            "ods" -> return "application/vnd.oasis.opendocument.spreadsheet"
            "docx" -> return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            "pptx" -> return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            "xlsx" -> return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            "doc" -> return "application/msword"
            "ppt" -> return "application/vnd.ms-powerpoint"
            "xls" -> return "application/vnd.ms-excel"
            "epub" -> return "application/epub+zip"
        }
        return null
    }

    private fun afterMessageFromWebView(messageAndParameterArray: Array<String?>) {
        when (messageAndParameterArray[0]) {
            "uno" -> when (messageAndParameterArray[1]) {
                ".uno:Copy", ".uno:Cut" -> populateClipboard()
                else -> {}
            }

            else -> {}
        }
    }

    private fun initiatePrint() {
        val printManager = getSystemService(PRINT_SERVICE) as PrintManager
        val printAdapter: PrintDocumentAdapter = PrintAdapter(this@LOActivity)
        printManager.print("Document", printAdapter, PrintAttributes.Builder().build())
    }

    /** Send message back to the shell (for example for the cloud save).  */
    fun sendBroadcast(event: String?, data: String?) {
        val intent: Intent = Intent(LO_ACTIVITY_BROADCAST)
        intent.putExtra(LO_ACTION_EVENT, event)
        intent.putExtra(LO_ACTION_DATA, data)
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
    }

    external fun saveAs(fileUri: String?, format: String?, options: String?)

    external fun getClipboardContent(aData: LokClipboardData?): Boolean

    external fun setClipboardContent(aData: LokClipboardData?)

    external fun paste(mimeType: String?, data: ByteArray?)

    external fun postUnoCommand(command: String?, arguments: String?, bNotifyWhenFinished: Boolean)

    private val clipboardMagic: String
        /** Returns a magic that specifies this application - and this document. */
        get() = CLIPBOARD_COOL_SIGNATURE + loadDocumentMillis.toString()

    /** Needs to be executed after the .uno:Copy / Paste has executed */
    fun populateClipboard() {
        val clipboardFile = File(getApplicationContext().getCacheDir(), CLIPBOARD_FILE_PATH)
        if (clipboardFile.exists()) clipboardFile.delete()

        val clipboardData = LokClipboardData()
        if (!this@LOActivity.getClipboardContent(clipboardData)) Log.e(TAG, "no clipboard to copy")
        else {
            clipboardData.writeToFile(clipboardFile)

            val text = clipboardData.getText()
            var html = clipboardData.getHtml()

            if (html != null) {
                var idx = html.indexOf("<meta name=\"generator\" content=\"")

                if (idx < 0) idx =
                    html.indexOf("<meta http-equiv=\"content-type\" content=\"text/html;")

                if (idx >= 0) { // inject our magic
                    val newHtml = StringBuffer(html)
                    newHtml.insert(
                        idx,
                        "<meta name=\"origin\" content=\"" + this.clipboardMagic + "\"/>\n"
                    )
                    html = newHtml.toString()
                }

                if (text == null || text.length == 0) Log.i(
                    TAG,
                    "set text to clipoard with: text '" + text + "' and html '" + html + "'"
                )

                clipData = ClipData.newHtmlText(ClipDescription.MIMETYPE_TEXT_HTML, text, html)
                clipboardManager!!.setPrimaryClip(clipData!!)
            }
        }
    }

    /** Do the paste, and return true if we should short-circuit the paste locally (ie. let the core handle that) */
    private fun performPaste(): Boolean {
        clipData = clipboardManager!!.getPrimaryClip()
        if (clipData == null) return false

        val clipDesc = clipData!!.getDescription()
        if (clipDesc == null) return false

        for (i in 0..<clipDesc.getMimeTypeCount()) {
            Log.d(TAG, "Pasting mime " + i + ": " + clipDesc.getMimeType(i))

            if (clipDesc.getMimeType(i) == ClipDescription.MIMETYPE_TEXT_HTML) {
                val html = clipData!!.getItemAt(i).getHtmlText()
                // Check if the clipboard content was made with the app
                if (html.contains(CLIPBOARD_COOL_SIGNATURE)) {
                    // Check if the clipboard content is from the same app instance
                    if (html.contains(this.clipboardMagic)) {
                        Log.i(
                            TAG,
                            "clipboard comes from us - same instance: short circuit it " + html
                        )
                        return true
                    } else {
                        Log.i(
                            TAG,
                            "clipboard comes from us - other instance: paste from clipboard file"
                        )

                        val clipboardFile =
                            File(getApplicationContext().getCacheDir(), CLIPBOARD_FILE_PATH)
                        var clipboardData: LokClipboardData? = null
                        if (clipboardFile.exists()) clipboardData =
                            LokClipboardData.createFromFile(clipboardFile)

                        if (clipboardData != null) {
                            this@LOActivity.setClipboardContent(clipboardData)
                            return true
                        } else {
                            // Couldn't get data from the clipboard file, but we can still paste html
                            val htmlByteArray: ByteArray? =
                                html.toByteArray(Charset.forName("UTF-8"))
                            this@LOActivity.paste("text/html", htmlByteArray)
                        }
                        return false
                    }
                } else {
                    Log.i(TAG, "foreign html '" + html + "'")
                    val htmlByteArray: ByteArray? = html.toByteArray(Charset.forName("UTF-8"))
                    this@LOActivity.paste("text/html", htmlByteArray)
                    return false
                }
            } else if (clipDesc.getMimeType(i).startsWith("image/")) {
                val item = clipData!!.getItemAt(i)
                val uri = item.getUri()
                try {
                    val imageStream = getContentResolver().openInputStream(uri)
                    val buffer = ByteArrayOutputStream()

                    var nRead: Int
                    val data = ByteArray(16384)
                    while ((imageStream!!.read(data, 0, data.size).also { nRead = it }) != -1) {
                        buffer.write(data, 0, nRead)
                    }

                    this@LOActivity.paste(clipDesc.getMimeType(i), buffer.toByteArray())
                    return false
                } catch (e: Exception) {
                    Log.d(TAG, "Failed to paste image: " + e.message)
                }
            }
        }

        // try the plaintext as the last resort
        for (i in 0..<clipDesc.getMimeTypeCount()) {
            Log.d(TAG, "Plain text paste attempt " + i + ": " + clipDesc.getMimeType(i))

            if (clipDesc.getMimeType(i) == ClipDescription.MIMETYPE_TEXT_PLAIN) {
                val clipItem = clipData!!.getItemAt(i)
                val text = clipItem.getText().toString()
                val textByteArray: ByteArray? = text.toByteArray(Charset.forName("UTF-8"))
                this@LOActivity.paste("text/plain;charset=utf-8", textByteArray)
            }
        }

        return false
    }

    companion object {
        const val TAG: String = "LOActivity"

        private const val ASSETS_EXTRACTED_GIT_COMMIT = "ASSETS_EXTRACTED_GIT_COMMIT"
        private const val PERMISSION_WRITE_EXTERNAL_STORAGE = 777
        private const val KEY_ENABLE_SHOW_DEBUG_INFO = "ENABLE_SHOW_DEBUG_INFO"

        private const val KEY_PROVIDER_ID = "providerID"
        private const val KEY_DOCUMENT_URI = "documentUri"
        private const val KEY_IS_EDITABLE = "isEditable"
        private const val KEY_INTENT_URI = "intentUri"
        private const val CLIPBOARD_FILE_PATH = "LibreofficeClipboardFile.data"
        private const val CLIPBOARD_COOL_SIGNATURE = "cool-clip-magic-4a22437e49a8-"
        const val RECENT_DOCUMENTS_KEY: String = "RECENT_DOCUMENTS_LIST"
        private const val USER_NAME_KEY = "USER_NAME"
        const val NIGHT_MODE_KEY: String = "NIGHT_MODE"
        private var FIRST_FOCUS = false
        const val REQUEST_SELECT_IMAGE_FILE: Int = 500
        const val REQUEST_SAVEAS_PDF: Int = 501
        const val REQUEST_SAVEAS_RTF: Int = 502
        const val REQUEST_SAVEAS_ODT: Int = 503
        const val REQUEST_SAVEAS_ODP: Int = 504
        const val REQUEST_SAVEAS_ODS: Int = 505
        const val REQUEST_SAVEAS_DOCX: Int = 506
        const val REQUEST_SAVEAS_PPTX: Int = 507
        const val REQUEST_SAVEAS_XLSX: Int = 508
        const val REQUEST_SAVEAS_DOC: Int = 509
        const val REQUEST_SAVEAS_PPT: Int = 510
        const val REQUEST_SAVEAS_XLS: Int = 511
        const val REQUEST_SAVEAS_EPUB: Int = 512
        const val REQUEST_COPY: Int = 600

        /** Broadcasting event for passing info back to the shell.  */
        const val LO_ACTIVITY_BROADCAST: String = "LOActivityBroadcast"

        /** Event description for passing info back to the shell.  */
        const val LO_ACTION_EVENT: String = "LOEvent"

        /** Data description for passing info back to the shell.  */
        const val LO_ACTION_DATA: String = "LOData"

        /** shared pref key for recent files.  */
        const val EXPLORER_PREFS_KEY: String = "EXPLORER_PREFS"

        private fun copyFromAssets(
            assetManager: AssetManager,
            fromAssetPath: String, targetDir: String
        ): Boolean {
            try {
                val files = assetManager.list(fromAssetPath)
                var res = true
                for (file in files!!) {
                    val dirOrFile = assetManager.list(fromAssetPath + "/" + file)
                    if (dirOrFile!!.size == 0) {
                        // noinspection ResultOfMethodCallIgnored
                        File(targetDir).mkdirs()
                        res = res and copyAsset(
                            assetManager,
                            fromAssetPath + "/" + file,
                            targetDir + "/" + file
                        )
                    } else res = res and copyFromAssets(
                        assetManager,
                        fromAssetPath + "/" + file,
                        targetDir + "/" + file
                    )
                }
                return res
            } catch (e: Exception) {
                e.printStackTrace()
                Log.e(TAG, "copyFromAssets failed: " + e.message)
                return false
            }
        }

        private fun copyAsset(
            assetManager: AssetManager,
            fromAssetPath: String,
            toPath: String?
        ): Boolean {
            var source: ReadableByteChannel? = null
            var dest: FileChannel? = null
            try {
                try {
                    source = Channels.newChannel(assetManager.open(fromAssetPath))
                    dest = FileOutputStream(toPath).getChannel()
                    var bytesTransferred: Long = 0
                    // might not copy all at once, so make sure everything gets copied....
                    val buffer = ByteBuffer.allocate(4096)
                    while (source.read(buffer) > 0) {
                        buffer.flip()
                        bytesTransferred += dest.write(buffer).toLong()
                        buffer.clear()
                    }
                    Log.v(
                        TAG,
                        "Success copying " + fromAssetPath + " to " + toPath + " bytes: " + bytesTransferred
                    )
                    return true
                } finally {
                    if (dest != null) dest.close()
                    if (source != null) source.close()
                }
            } catch (e: FileNotFoundException) {
                Log.e(TAG, "file " + fromAssetPath + " not found! " + e.message)
                return false
            } catch (e: IOException) {
                Log.e(
                    TAG,
                    "failed to copy file " + fromAssetPath + " from assets to " + toPath + " - " + e.message
                )
                return false
            }
        }


        /** True if the App is running under ChromeOS.  */
        fun isChromeOS(context: Context): Boolean {
            return context.getPackageManager()
                .hasSystemFeature("org.chromium.arc.device_management")
        }

        init {
            System.loadLibrary("androidapp")
        }

        /**
         * @param message The message to test for the prefix
         * @param prefix The prefix to test for
         * @return true if the decoded message starts with the prefix, else false
         */
        private fun messageStartsWith(message: ByteArray, prefix: String): Boolean {
            val prefixBytes = prefix.toByteArray()
            for (i in prefixBytes.indices) {
                if (message[i] != prefixBytes[i]) {
                    return false
                }
            }

            return true
        }

        fun createNewFileInputDialog(
            activity: Activity,
            defaultFileName: String?,
            mimeType: String?,
            requestCode: Int
        ) {
            val i = Intent(Intent.ACTION_CREATE_DOCUMENT)

            // The mime type and category must be set
            i.setType(mimeType)
            i.addCategory(Intent.CATEGORY_OPENABLE)

            i.putExtra(Intent.EXTRA_TITLE, defaultFileName)

            // Try to default to the Documents folder
            val documentsUri =
                Uri.parse("content://com.android.externalstorage.documents/document/home%3A")
            i.putExtra(DocumentsContract.EXTRA_INITIAL_URI, documentsUri)

            activity.startActivityForResult(i, requestCode)
        }
    }
} /* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */

