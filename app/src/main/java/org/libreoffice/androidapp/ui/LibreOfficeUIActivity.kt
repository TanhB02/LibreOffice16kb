/* -*- tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */ /*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package org.libreoffice.androidapp.ui

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.preference.PreferenceManager
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import android.view.ContextMenu
import android.view.ContextMenu.ContextMenuInfo
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.ActionBar
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.appcompat.widget.Toolbar
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.view.ViewCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.navigation.NavigationView
import org.libreoffice.androidapp.R
import org.libreoffice.androidlib.LOActivity
import org.libreoffice.androidlib.LOActivityLauncher
import org.libreoffice.androidlib.utils.UtilsOffice.createNewFile
import org.libreoffice.androidlib.utils.UtilsOffice.openFile
import java.io.FileFilter
import java.io.FilenameFilter
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.Arrays

class LibreOfficeUIActivity : AppCompatActivity() {
    private val LOGTAG: String = LibreOfficeUIActivity::class.java.getSimpleName()
    private var prefs: SharedPreferences? = null
    private var filterMode = FileUtilities.ALL
    private var sortMode = 0
    private var showHiddenFiles = false
    var fileFilter: FileFilter? = null
    var filenameFilter: FilenameFilter? = null
    private var currentlySelectedFile: Uri? = null

    private val drawerLayout: DrawerLayout? = null
    private val navigationDrawer: NavigationView? = null
    private var actionBar: ActionBar? = null
    private var recentRecyclerView: RecyclerView? = null

    //kept package-private to use these in recyclerView's adapter
    @JvmField
    var noRecentItemsTextView: TextView? = null

    private var fabOpenAnimation: Animation? = null
    private var fabCloseAnimation: Animation? = null
    private var isFabMenuOpen = false
    private var editFAB: FloatingActionButton? = null
    private var writerFAB: FloatingActionButton? = null
    private var impressFAB: FloatingActionButton? = null
    private var calcFAB: FloatingActionButton? = null
    private var writerLayout: LinearLayout? = null
    private var impressLayout: LinearLayout? = null
    private var calcLayout: LinearLayout? = null

    /** Recent files list vs. grid switch.  */
    private var mRecentFilesListOrGrid: ImageView? = null

    public override fun onCreate(savedInstanceState: Bundle?) {
        PreferenceManager.setDefaultValues(this, R.xml.documentprovider_preferences, false)
        readPreferences()
        val mode = prefs!!.getInt(NIGHT_MODE_KEY, AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        AppCompatDelegate.setDefaultNightMode(mode)
        super.onCreate(savedInstanceState)
        Log.d("TANHXXXX =>>>>>", " oncreate")
        Toast.makeText(this, "LibreOfficeUIActivity onCreate", Toast.LENGTH_SHORT).show()


        // initialize document provider factory
        //DocumentProviderFactory.initialize(this);
        //documentProviderFactory = DocumentProviderFactory.getInstance();


        // Register the LOActivity events broadcast receiver
        LocalBroadcastManager.getInstance(this).registerReceiver(
            mLOActivityReceiver,
            IntentFilter(LOActivity.LO_ACTIVITY_BROADCAST)
        )

        // init UI and populate with contents from the provider
        createUI()

        fabOpenAnimation = AnimationUtils.loadAnimation(this, R.anim.fab_open)
        fabCloseAnimation = AnimationUtils.loadAnimation(this, R.anim.fab_close)
    }

    private val recentDocuments: Array<String?>
        get() {
            val joinedStrings: String =
                prefs!!.getString(RECENT_DOCUMENTS_KEY, "")!!
            if (joinedStrings.isEmpty()) return arrayOf<String?>()

            // we are using \n as delimiter
            return joinedStrings.split("\n".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
        }

    /** Update the recent files list.  */
    fun updateRecentFiles() {
        // update also the icon switching between list and grid
        if (this.isViewModeList) mRecentFilesListOrGrid!!.setImageResource(R.drawable.ic_view_module_black_24dp)
        else mRecentFilesListOrGrid!!.setImageResource(R.drawable.ic_list_black_24dp)

        val recentFileStrings = this.recentDocuments

        val recentUris = ArrayList<Uri>()
        for (recentFileString in recentFileStrings) {
            try {
                recentUris.add(Uri.parse(recentFileString))
            } catch (e: RuntimeException) {
                e.printStackTrace()
            }
        }

        // TODO FileUtilities.sortFiles(filePaths, sortMode);
        recentRecyclerView!!.setLayoutManager(
            if (this.isViewModeList) LinearLayoutManager(this) else GridLayoutManager(
                this,
                2
            )
        )
        recentRecyclerView!!.setAdapter(RecentFilesAdapter(this, recentUris))
    }

    /** access shared preferences from the activity instance  */
    fun getPrefs(): SharedPreferences {
        return prefs!!
    }

    fun createUI() {
        setContentView(R.layout.activity_document_browser)

        val toolbar = findViewById<Toolbar?>(R.id.toolbar)
        setSupportActionBar(toolbar)

        actionBar = getSupportActionBar()

        if (actionBar != null) {
            actionBar!!.setDisplayHomeAsUpEnabled(true)
        }

        setupFloatingActionButton()

        recentRecyclerView = findViewById<RecyclerView>(R.id.list_recent)
        noRecentItemsTextView = findViewById<TextView?>(R.id.no_recent_items_msg)

        // Icon to switch showing the recent files as list vs. as grid
        mRecentFilesListOrGrid = findViewById<View?>(R.id.recent_list_or_grid) as ImageView
        mRecentFilesListOrGrid!!.setOnClickListener(object : View.OnClickListener {
            override fun onClick(v: View?) {
                toggleViewMode()
                updateRecentFiles()
            }
        })

        updateRecentFiles()

        // allow context menu for the various files - for Open and Share
        registerForContextMenu(recentRecyclerView)
    }

    /** Initialize the FloatingActionButton.  */
    private fun setupFloatingActionButton() {
        editFAB = findViewById<FloatingActionButton>(R.id.editFAB)
        if (LOActivity.isChromeOS(this)) {
            val dp = getResources().getDisplayMetrics().density.toInt()
            val layoutParams = editFAB!!.getLayoutParams() as ConstraintLayout.LayoutParams
            layoutParams.leftToLeft = ConstraintLayout.LayoutParams.PARENT_ID
            layoutParams.bottomMargin = dp * 24
            editFAB!!.setCustomSize(dp * 70)
        }

        editFAB!!.setOnClickListener(object : View.OnClickListener {
            override fun onClick(v: View?) {
                if (isFabMenuOpen) collapseFabMenu()
                else expandFabMenu()
            }
        })
        val clickListener: View.OnClickListener = object : View.OnClickListener {
            override fun onClick(view: View) {
                when (view.getId()) {
                    R.id.newWriterFAB, R.id.writerLayout -> createNewFileInputDialog(
                        getString(R.string.new_textdocument) + ".docx",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        CREATE_DOCUMENT_REQUEST_CODE
                    )

                    R.id.newCalcFAB, R.id.calcLayout -> createNewFileInputDialog(
                        getString(R.string.new_spreadsheet) + ".xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        CREATE_SPREADSHEET_REQUEST_CODE
                    )

                    R.id.newImpressFAB, R.id.impressLayout -> createNewFileInputDialog(
                        getString(R.string.new_presentation) + ".pptx",
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        CREATE_PRESENTATION_REQUEST_CODE
                    )
                }
            }
        }

        writerFAB = findViewById<FloatingActionButton>(R.id.newWriterFAB)
        writerFAB!!.setOnClickListener(clickListener)

        calcFAB = findViewById<FloatingActionButton>(R.id.newCalcFAB)
        calcFAB!!.setOnClickListener(clickListener)

        impressFAB = findViewById<FloatingActionButton>(R.id.newImpressFAB)
        impressFAB!!.setOnClickListener(clickListener)

        writerLayout = findViewById<LinearLayout>(R.id.writerLayout)
        writerLayout!!.setOnClickListener(clickListener)

        impressLayout = findViewById<LinearLayout>(R.id.impressLayout)
        impressLayout!!.setOnClickListener(clickListener)

        calcLayout = findViewById<LinearLayout>(R.id.calcLayout)
        calcLayout!!.setOnClickListener(clickListener)
    }

    /** Expand the Floating action button.  */
    private fun expandFabMenu() {
        if (isFabMenuOpen) return

        ViewCompat.animate(editFAB!!).rotation(-45f).withLayer().setDuration(300)
            .setInterpolator(OvershootInterpolator(0f)).start()
        impressLayout!!.startAnimation(fabOpenAnimation)
        writerLayout!!.startAnimation(fabOpenAnimation)
        calcLayout!!.startAnimation(fabOpenAnimation)
        writerFAB!!.setClickable(true)
        impressFAB!!.setClickable(true)
        calcFAB!!.setClickable(true)
        isFabMenuOpen = true
    }

    /** Collapse the Floating action button.  */
    private fun collapseFabMenu() {
        if (!isFabMenuOpen) return

        ViewCompat.animate(editFAB!!).rotation(0f).withLayer().setDuration(300)
            .setInterpolator(OvershootInterpolator(0f)).start()
        writerLayout!!.startAnimation(fabCloseAnimation)
        impressLayout!!.startAnimation(fabCloseAnimation)
        calcLayout!!.startAnimation(fabCloseAnimation)
        writerFAB!!.setClickable(false)
        impressFAB!!.setClickable(false)
        calcFAB!!.setClickable(false)
        isFabMenuOpen = false
    }


    override fun onBackPressed() {
        if (drawerLayout!!.isDrawerOpen(navigationDrawer!!)) {
            drawerLayout.closeDrawer(navigationDrawer)
            collapseFabMenu()
        } else if (isFabMenuOpen) {
            collapseFabMenu()
        } else {
            // exit the app
            super.onBackPressed()
        }
    }

    override fun onCreateContextMenu(
        menu: ContextMenu?, v: View?,
        menuInfo: ContextMenuInfo?
    ) {
        super.onCreateContextMenu(menu, v, menuInfo)
        val inflater = getMenuInflater()
        inflater.inflate(R.menu.context_menu, menu)
    }

    override fun onContextItemSelected(item: MenuItem): Boolean {
        when (item.getItemId()) {
            R.id.context_menu_open -> {
                openFile(currentlySelectedFile)
                return true
            }

            R.id.context_menu_share -> {
                share(currentlySelectedFile)
                return true
            }

            R.id.context_menu_remove_from_list -> {
                removeFromList(currentlySelectedFile)
                return true
            }

            else -> return super.onContextItemSelected(item)
        }
    }

    fun openContextMenu(view: View, uri: Uri?) {
        this.currentlySelectedFile = uri

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            view.showContextMenu(view.getPivotX(), view.getPivotY())
        } else view.showContextMenu()
    }

    val isViewModeList: Boolean
        get() = prefs!!.getString(
            EXPLORER_VIEW_TYPE_KEY,
            GRID_VIEW
        ) == LIST_VIEW

    /** Change the view state (without updating the UI).  */
    private fun toggleViewMode() {
        if (this.isViewModeList) prefs!!.edit().putString(EXPLORER_VIEW_TYPE_KEY, GRID_VIEW).apply()
        else prefs!!.edit().putString(EXPLORER_VIEW_TYPE_KEY, LIST_VIEW).apply()
    }

    /** Build Intent to edit a Uri using the new multi-process architecture.  */
    fun getIntentToEdit(uri: Uri?): Intent {
        val i = Intent(Intent.ACTION_EDIT, uri)
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        i.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)

        val packageName = getApplicationContext().getPackageName()
        val componentName = ComponentName(packageName, LOActivityLauncher::class.java.getName())
        i.setComponent(componentName)

        return i
    }

    /*
     */
    /** Start editing of the given Uri.  */ /*

    public void open(final Uri uri) {
        if (uri == null)
            return;

        addDocumentToRecents(uri);

        Intent i = getIntentToEdit(uri);
        startActivityForResult(i, LO_ACTIVITY_REQUEST_CODE);
    }
*/
    /** Start editing of the given Uri.  */
    fun open(uri: Uri?) {
        if (uri == null) return

        addDocumentToRecents(uri)

        val i = getIntentToEdit(uri)
        startActivity(i)
    }

    /** Opens an Input dialog to get the name of new file.  */
    private fun createNewFileInputDialog(
        defaultFileName: String?,
        mimeType: String?,
        requestCode: Int
    ) {
        collapseFabMenu()
        // call existing function in LOActivity to avoid having the same code twice
        LOActivity.createNewFileInputDialog(this, defaultFileName, mimeType, requestCode)
    }

    /** Context menu item handling.  */
    private fun share(uri: Uri?) {
        if (uri == null) return

        val intentShareFile = Intent(Intent.ACTION_SEND)
        intentShareFile.putExtra(Intent.EXTRA_STREAM, uri)
        intentShareFile.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        intentShareFile.setDataAndType(
            uri,
            this@LibreOfficeUIActivity.getContentResolver().getType(uri)
        )
        this@LibreOfficeUIActivity.startActivity(
            Intent.createChooser(
                intentShareFile,
                this@LibreOfficeUIActivity.getString(R.string.share_document)
            )
        )
    }

    /** Context menu item handling.  */
    private fun removeFromList(uri: Uri?) {
        if (uri == null) return

        val recentFileStrings = this.recentDocuments
        var joined = ""
        val recentUris = ArrayList<Uri>()

        for (recentFileString in recentFileStrings) {
            try {
                if (uri.toString() != recentFileString) {
                    recentUris.add(Uri.parse(recentFileString))
                    joined = joined + recentFileString + "\n"
                }
            } catch (e: RuntimeException) {
                e.printStackTrace()
            }
        }

        prefs!!.edit().putString(RECENT_DOCUMENTS_KEY, joined).apply()

        recentRecyclerView!!.setAdapter(RecentFilesAdapter(this, recentUris))
    }

    /** Setup the toolbar's menu.  */
    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        val inflater = getMenuInflater()
        inflater.inflate(R.menu.view_menu, menu)

        return true
    }

    /** Start an ACTION_OPEN_DOCUMENT Intent to trigger opening a document.  */
    private fun openDocument() {
        collapseFabMenu()

        val i = Intent()
        i.addCategory(Intent.CATEGORY_OPENABLE)

        // set only the allowed mime types
        // NOTE: If updating the list here, also check the AndroidManifest.xml,
        // I didn't find a way how to do it from one central place :-(
        i.setType("*/*")

        // from some reason, the file picker on ChromeOS is confused when it
        // gets the EXTRA_MIME_TYPES; to the user it looks like it is
        // impossible to choose any files, unless they notice the dropdown in
        // the bottom left and choose "All files".  Interestingly, SVG / SVGZ
        // are shown there as an option, the other mime types are just blank
        if (!LOActivity.isChromeOS(this)) {
            val mimeTypes: Array<String> = arrayOf( // ODF
                "application/vnd.oasis.opendocument.text",
                "application/vnd.oasis.opendocument.graphics",
                "application/vnd.oasis.opendocument.presentation",
                "application/vnd.oasis.opendocument.spreadsheet",
                "application/vnd.oasis.opendocument.text-flat-xml",
                "application/vnd.oasis.opendocument.graphics-flat-xml",
                "application/vnd.oasis.opendocument.presentation-flat-xml",
                "application/vnd.oasis.opendocument.spreadsheet-flat-xml",  // ODF templates

                "application/vnd.oasis.opendocument.text-template",
                "application/vnd.oasis.opendocument.spreadsheet-template",
                "application/vnd.oasis.opendocument.graphics-template",
                "application/vnd.oasis.opendocument.presentation-template",  // MS

                "application/rtf",
                "text/rtf",
                "application/msword",
                "application/vnd.ms-powerpoint",
                "application/vnd.ms-excel",
                "application/vnd.visio",
                "application/vnd.visio.xml",
                "application/x-mspublisher",
                "application/vnd.ms-excel.sheet.binary.macroenabled.12",
                "application/vnd.ms-excel.sheet.macroenabled.12",  // OOXML

                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // OOXML templates

                "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
                "application/vnd.openxmlformats-officedocument.presentationml.template",  // other

                "text/csv",
                "text/plain",
                "text/comma-separated-values",
                "application/vnd.ms-works",
                "application/vnd.apple.keynote",
                "application/x-abiword",
                "application/x-pagemaker",
                "image/x-emf",
                "image/x-svm",
                "image/x-wmf",
                "image/svg+xml",
                "application/pdf"
            )
            i.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
        }

        // TODO remember where the user picked the file the last time
        // TODO and that should default to Context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
        //i.putExtra(DocumentsContract.EXTRA_INITIAL_URI, previousDirectoryPath);
        try {
            i.setAction(Intent.ACTION_OPEN_DOCUMENT)
            startActivityForResult(i, OPEN_FILE_REQUEST_CODE)
            return
        } catch (exception: ActivityNotFoundException) {
            Log.w(
                LOGTAG,
                "Start of activity with ACTION_OPEN_DOCUMENT failed (no activity found). Trying the fallback."
            )
        }
        // Fallback
        i.setAction(Intent.ACTION_GET_CONTENT)
        startActivityForResult(i, OPEN_FILE_REQUEST_CODE)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Will close the drawer if the home button is pressed


        when (item.getItemId()) {
            R.id.action_open_file -> openDocument()
            else -> return super.onOptionsItemSelected(item)
        }
        return true
    }

    fun readPreferences() {
        prefs = getSharedPreferences(EXPLORER_PREFS_KEY, MODE_PRIVATE)
        sortMode = prefs!!.getInt(SORT_MODE_KEY, FileUtilities.SORT_AZ)
        val defaultPrefs = PreferenceManager.getDefaultSharedPreferences(getBaseContext())
        filterMode = defaultPrefs.getString(FILTER_MODE_KEY, "-1")!!.toInt()
        showHiddenFiles = defaultPrefs.getBoolean(ENABLE_SHOW_HIDDEN_FILES_KEY, false)

        val i = this.getIntent()
        if (i.hasExtra(CURRENT_DIRECTORY_KEY)) {
            /*try {
                currentDirectory = documentProvider.createFromUri(this, new URI(
                        i.getStringExtra(CURRENT_DIRECTORY_KEY)));
            } catch (URISyntaxException e) {
                currentDirectory = documentProvider.getRootDirectory(this);
            }*/
            Log.d(LOGTAG, CURRENT_DIRECTORY_KEY)
        }

        if (i.hasExtra(FILTER_MODE_KEY)) {
            filterMode = i.getIntExtra(FILTER_MODE_KEY, FileUtilities.ALL)
            Log.d(LOGTAG, FILTER_MODE_KEY)
        }
    }


    override fun onSaveInstanceState(outState: Bundle) {
        // TODO Auto-generated method stub
        super.onSaveInstanceState(outState)

        outState.putInt(FILTER_MODE_KEY, filterMode)

        outState.putBoolean(ENABLE_SHOW_HIDDEN_FILES_KEY, showHiddenFiles)

        //prefs.edit().putInt(EXPLORER_VIEW_TYPE, viewType).commit();
        Log.d(LOGTAG, "savedInstanceState")
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        // TODO Auto-generated method stub
        super.onRestoreInstanceState(savedInstanceState)
        if (savedInstanceState.isEmpty()) {
            return
        }
        /*if (documentProvider == null) {
            Log.d(LOGTAG, "onRestoreInstanceState - documentProvider is null");
            documentProvider = DocumentProviderFactory.getInstance()
                    .getProvider(savedInstanceState.getInt(DOC_PROVIDER_KEY));
        }
        try {
            currentDirectory = documentProvider.createFromUri(this, new URI(
                    savedInstanceState.getString(CURRENT_DIRECTORY_KEY)));
        } catch (URISyntaxException e) {
            currentDirectory = documentProvider.getRootDirectory(this);
        }*/
        filterMode = savedInstanceState.getInt(FILTER_MODE_KEY, FileUtilities.ALL)
        showHiddenFiles = savedInstanceState.getBoolean(ENABLE_SHOW_HIDDEN_FILES_KEY, false)
        //openDirectory(currentDirectory);
        Log.d(LOGTAG, "onRestoreInstanceState")
        //Log.d(LOGTAG, currentDirectory.toString() + Integer.toString(filterMode));
    }

    /** Receiver for receiving messages from LOActivity - like that Save was performed and similar.  */
    private val mLOActivityReceiver: BroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent) {
            val event = intent.getStringExtra(LOActivity.LO_ACTION_EVENT)
            Log.d(LOGTAG, "Received a message from LOActivity: " + event)

            // Handle various events from LOActivity
            if (event == "SAVE") {
                // TODO probably kill this, we don't need to do anything here any more
            }
        }
    }

    /** Uploading back when we return from the LOActivity.  */
    public override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        when (requestCode) {
            LO_ACTIVITY_REQUEST_CODE -> {
                // LOActivity hiện tại chạy trong process riêng biệt
                // Chúng ta không cần xử lý kết quả trả về nữa vì service sẽ quản lý việc đóng
                Log.d(LOGTAG, "LOActivity has finished.")
            }

            OPEN_FILE_REQUEST_CODE -> {
                Log.d(LOGTAG, "File open chooser has finished, starting the LOActivity.")
                if (resultCode != RESULT_OK || data == null) return

                val uri = data.getData()
                if (uri == null) return

                getContentResolver().takePersistableUriPermission(
                    uri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )

                openFile(uri)
            }

            CREATE_DOCUMENT_REQUEST_CODE, CREATE_SPREADSHEET_REQUEST_CODE, CREATE_PRESENTATION_REQUEST_CODE -> {
                if (resultCode != RESULT_OK || data == null) return

                val uri = data.getData()
                getContentResolver().takePersistableUriPermission(
                    uri!!,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )

                val extension =
                    if (requestCode == CREATE_DOCUMENT_REQUEST_CODE) "docx" else (if (requestCode == CREATE_SPREADSHEET_REQUEST_CODE) "xlsx" else "pptx")
                createNewFile(uri, extension)

                openFile(uri)
            }
        }
    }

    override fun onPause() {
        super.onPause()
        Log.d(LOGTAG, "onPause")
    }

    override fun onResume() {
        super.onResume()
        Log.d(LOGTAG, "onResume")
        Log.d(LOGTAG, "sortMode=" + sortMode + " filterMode=" + filterMode)
        createUI()
    }

    override fun onStart() {
        super.onStart()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU && ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.i(LOGTAG, "no permission to read external storage - asking for permission")
            ActivityCompat.requestPermissions(
                this,
                arrayOf<String>(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                PERMISSION_WRITE_EXTERNAL_STORAGE
            )
        }
    }

    override fun onStop() {
        super.onStop()
        Log.d("TANHXXXX =>>>>>", " onStop")
    }

    override fun onDestroy() {
        super.onDestroy()
        LocalBroadcastManager.getInstance(this).unregisterReceiver(mLOActivityReceiver)
        Log.d("TANHXXXX =>>>>>", " onDestroy")
    }

    private fun dpToPx(dp: Int): Int {
        val scale = getApplicationContext().getResources().getDisplayMetrics().density
        return (dp * scale + 0.5f).toInt()
    }

    private fun addDocumentToRecents(uri: Uri) {
        val newRecent = uri.toString()

        // Create array to work with (have to copy the content)
        val recentsArrayList = ArrayList<String>(Arrays.asList<String?>(*this.recentDocuments))

        //remove string if present, so that it doesn't appear multiple times
        recentsArrayList.remove(newRecent)

        //put the new value in the first place
        recentsArrayList.add(0, newRecent)

        val RECENTS_SIZE = 30

        while (recentsArrayList.size > RECENTS_SIZE) {
            recentsArrayList.removeAt(recentsArrayList.size - 1)
        }

        // Join the array, use \n's as delimiters
        val joined = TextUtils.join("\n", recentsArrayList)
        prefs!!.edit().putString(RECENT_DOCUMENTS_KEY, joined).apply()

        // Update app shortcuts (7.0 and above)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            val shortcutManager = getSystemService<ShortcutManager>(ShortcutManager::class.java)

            // Remove all shortcuts, and apply new ones.
            shortcutManager.removeAllDynamicShortcuts()

            val shortcuts = ArrayList<ShortcutInfo?>()
            var i = 0
            for (pathString in recentsArrayList) {
                if (pathString.isEmpty()) continue

                // I cannot see more than 3 anyway, and with too many we get
                // an exception, so let's limit to 3
                if (i >= 3 || i >= ShortcutManagerCompat.getMaxShortcutCountPerActivity(this)) break

                ++i

                // Find the appropriate drawable
                var drawable = 0
                when (FileUtilities.getType(pathString)) {
                    FileUtilities.DOC -> drawable = R.drawable.writer
                    FileUtilities.CALC -> drawable = R.drawable.calc
                    FileUtilities.DRAWING -> drawable = R.drawable.draw
                    FileUtilities.IMPRESS -> drawable = R.drawable.impress
                }

                val shortcutUri = Uri.parse(pathString)
                val filename = RecentFilesAdapter.getUriFilename(this, shortcutUri)

                if (filename == null) continue

                val intent = getIntentToEdit(shortcutUri)
                val builder = ShortcutInfo.Builder(this, filename)
                    .setShortLabel(filename)
                    .setLongLabel(filename)
                    .setIntent(intent)

                if (drawable != 0) builder.setIcon(Icon.createWithResource(this, drawable))

                shortcuts.add(builder.build())
            }

            try {
                shortcutManager.setDynamicShortcuts(shortcuts)
            } catch (e: Exception) {
                Log.e(LOGTAG, "Failed to set the dynamic shortcuts: " + e.message)
            }
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String?>,
        grantResults: IntArray
    ) {
        when (requestCode) {
            PERMISSION_WRITE_EXTERNAL_STORAGE -> {
                if (permissions.size > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) return

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val showRationale =
                        shouldShowRequestPermissionRationale(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    val rationaleDialogBuilder = AlertDialog.Builder(this)
                        .setCancelable(false)
                        .setTitle(getString(R.string.title_permission_required))
                        .setMessage(getString(R.string.reason_required_to_read_documents))
                    if (showRationale) {
                        rationaleDialogBuilder.setPositiveButton(
                            getString(R.string.positive_ok),
                            object : DialogInterface.OnClickListener {
                                override fun onClick(dialog: DialogInterface?, which: Int) {
                                    ActivityCompat.requestPermissions(
                                        this@LibreOfficeUIActivity,
                                        arrayOf<String>(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                                        PERMISSION_WRITE_EXTERNAL_STORAGE
                                    )
                                }
                            })
                            .setNegativeButton(
                                getString(R.string.negative_im_sure),
                                object : DialogInterface.OnClickListener {
                                    override fun onClick(dialog: DialogInterface?, which: Int) {
                                        this@LibreOfficeUIActivity.finish()
                                    }
                                })
                            .create()
                            .show()
                    } else {
                        rationaleDialogBuilder.setPositiveButton(
                            getString(R.string.positive_ok),
                            object : DialogInterface.OnClickListener {
                                override fun onClick(dialog: DialogInterface?, which: Int) {
                                    val intent =
                                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                                    val uri = Uri.fromParts("package", getPackageName(), null)
                                    intent.setData(uri)
                                    startActivity(intent)
                                }
                            })
                            .setNegativeButton(
                                R.string.negative_cancel,
                                object : DialogInterface.OnClickListener {
                                    override fun onClick(dialog: DialogInterface?, which: Int) {
                                        this@LibreOfficeUIActivity.finish()
                                    }
                                })
                            .create()
                            .show()
                    }
                }
            }

            else -> super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        }
    }

    companion object {
        // dynamic permissions IDs
        private const val PERMISSION_WRITE_EXTERNAL_STORAGE = 0

        /** The document that is being edited - to know what to save back to cloud.  */ //private IFile mCurrentDocument;
        private const val CURRENT_DIRECTORY_KEY = "CURRENT_DIRECTORY"
        private const val DOC_PROVIDER_KEY = "CURRENT_DOCUMENT_PROVIDER"
        private const val FILTER_MODE_KEY = "FILTER_MODE"
        const val EXPLORER_VIEW_TYPE_KEY: String = "EXPLORER_VIEW_TYPE"
        const val EXPLORER_PREFS_KEY: String = "EXPLORER_PREFS"
        const val SORT_MODE_KEY: String = "SORT_MODE"
        const val RECENT_DOCUMENTS_KEY: String = "RECENT_DOCUMENTS_LIST"
        private const val ENABLE_SHOW_HIDDEN_FILES_KEY = "ENABLE_SHOW_HIDDEN_FILES"

        const val NEW_FILE_PATH_KEY: String = "NEW_FILE_PATH_KEY"
        const val NEW_DOC_TYPE_KEY: String = "NEW_DOC_TYPE_KEY"
        const val NIGHT_MODE_KEY: String = "NIGHT_MODE"

        const val GRID_VIEW: String = "0"
        const val LIST_VIEW: String = "1"

        /** Request code to evaluate that we are returning from the LOActivity.  */
        const val LO_ACTIVITY_REQUEST_CODE: Int = 42
        private const val OPEN_FILE_REQUEST_CODE = 43
        private const val CREATE_DOCUMENT_REQUEST_CODE = 44
        private const val CREATE_SPREADSHEET_REQUEST_CODE = 45
        private const val CREATE_PRESENTATION_REQUEST_CODE = 46
    }
} /* vim:set shiftwidth=4 softtabstop=4 expandtab: */

